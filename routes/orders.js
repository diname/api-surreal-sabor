const express = require('express')
const router = express.Router()
const { Order, Cart } = require('../models/Order')
const { Customer } = require('../models/Customer')
const { mercadoPagoMock } = require('../services/mercadoPagoMock')
const {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
} = require('../services/emailService')

// Criar pedido
router.post('/', async (req, res) => {
  try {
    const { customer_data, payment_method, session_id } = req.body

    // Validar dados obrigatórios
    if (
      !customer_data ||
      !customer_data.full_name ||
      !customer_data.email ||
      !customer_data.phone ||
      !customer_data.address
    ) {
      return res.status(400).json({
        message: 'Dados obrigatórios: nome completo, email, telefone e endereço'
      })
    }

    if (!payment_method || !['pix', 'boleto'].includes(payment_method)) {
      return res.status(400).json({
        message: 'Método de pagamento deve ser pix ou boleto'
      })
    }

    const sessionId = session_id || req.session?.cart_id
    if (!sessionId) {
      return res
        .status(400)
        .json({ message: 'Sessão do carrinho não encontrada' })
    }

    // Buscar itens do carrinho
    Cart.getItems(sessionId, async (err, cartItems) => {
      if (err) {
        console.error('Erro ao buscar itens do carrinho:', err)
        return res.status(500).json({ message: 'Erro interno do servidor' })
      }

      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Carrinho vazio' })
      }

      // Calcular total
      const totalAmount = cartItems.reduce((sum, item) => {
        return sum + item.quantity * item.price
      }, 0)

      // Criar ou buscar cliente
      Customer.findByEmail(customer_data.email, (err, existingCustomer) => {
        if (err) {
          console.error('Erro ao buscar cliente:', err)
          return res.status(500).json({ message: 'Erro interno do servidor' })
        }

        const processOrder = (customerId) => {
          // Preparar dados do pedido
          const orderData = {
            customer_id: customerId,
            total_amount: totalAmount,
            payment_method: payment_method,
            items: cartItems.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.price
            }))
          }

          // Criar pedido
          Order.create(orderData, async (err, orderResult) => {
            if (err) {
              console.error('Erro ao criar pedido:', err)
              return res
                .status(500)
                .json({ message: 'Erro interno do servidor' })
            }

            try {
              // Processar pagamento
              let paymentResult

              if (payment_method === 'pix') {
                paymentResult = await mercadoPagoMock.createPixPayment({
                  transaction_amount: totalAmount,
                  description: `Pedido ${orderResult.order_number} - Surreal Sabor`,
                  payment_method_id: 'pix',
                  payer: {
                    email: customer_data.email,
                    first_name: customer_data.full_name.split(' ')[0],
                    last_name:
                      customer_data.full_name.split(' ').slice(1).join(' ') ||
                      ''
                  }
                })
              } else {
                paymentResult = await mercadoPagoMock.createBoletoPayment({
                  transaction_amount: totalAmount,
                  description: `Pedido ${orderResult.order_number} - Surreal Sabor`,
                  payment_method_id: 'bolbradesco',
                  payer: {
                    email: customer_data.email,
                    first_name: customer_data.full_name.split(' ')[0],
                    last_name:
                      customer_data.full_name.split(' ').slice(1).join(' ') ||
                      ''
                  }
                })
              }

              // Atualizar pedido com dados do pagamento
              const paymentData = {
                payment_status: paymentResult.status,
                payment_id: paymentResult.id,
                pix_qr_code:
                  payment_method === 'pix'
                    ? paymentResult.point_of_interaction?.transaction_data
                        ?.qr_code
                    : null,
                boleto_url:
                  payment_method === 'boleto'
                    ? paymentResult.transaction_details?.external_resource_url
                    : null,
                boleto_barcode:
                  payment_method === 'boleto'
                    ? paymentResult.transaction_details
                        ?.payment_method_reference_id
                    : null
              }

              Order.updatePayment(orderResult.id, paymentData, (err) => {
                if (err) {
                  console.error('Erro ao atualizar pagamento:', err)
                  return res
                    .status(500)
                    .json({ message: 'Erro interno do servidor' })
                }

                // Limpar carrinho após criar pedido
                Cart.clear(sessionId, (err) => {
                  if (err) {
                    console.error('Erro ao limpar carrinho:', err)
                  }
                })

                // Retornar dados do pedido
                const orderResponse = {
                  order_id: orderResult.id,
                  order_number: orderResult.order_number,
                  total_amount: totalAmount,
                  payment_method: payment_method,
                  payment_id: paymentResult.id,
                  payment_status: paymentResult.status,
                  pix_qr_code: paymentData.pix_qr_code,
                  boleto_url: paymentData.boleto_url,
                  boleto_barcode: paymentData.boleto_barcode,
                  expires_at: paymentResult.date_of_expiration
                }

                // Enviar email de confirmação
                const emailData = {
                  order_number: orderResult.order_number,
                  total_amount: totalAmount,
                  payment_method: payment_method,
                  items: cartItems.map((item) => ({
                    name: item.name,
                    quantity: item.quantity,
                    unit_price: item.price
                  }))
                }

                sendOrderConfirmationEmail(emailData, customer_data)
                  .then((emailResult) => {
                    console.log(
                      'Email de confirmação enviado:',
                      emailResult.success
                    )
                  })
                  .catch((emailError) => {
                    console.error(
                      'Erro ao enviar email de confirmação:',
                      emailError
                    )
                  })

                res.json(orderResponse)
              })
            } catch (paymentError) {
              console.error('Erro ao processar pagamento:', paymentError)
              res.status(500).json({ message: 'Erro ao processar pagamento' })
            }
          })
        }

        if (existingCustomer) {
          // Atualizar dados do cliente existente
          Customer.update(existingCustomer.id, customer_data, (err) => {
            if (err) {
              console.error('Erro ao atualizar cliente:', err)
              return res
                .status(500)
                .json({ message: 'Erro interno do servidor' })
            }
            processOrder(existingCustomer.id)
          })
        } else {
          // Criar novo cliente
          Customer.create(customer_data, (err, result) => {
            if (err) {
              console.error('Erro ao criar cliente:', err)
              return res
                .status(500)
                .json({ message: 'Erro interno do servidor' })
            }
            processOrder(result.id)
          })
        }
      })
    })
  } catch (error) {
    console.error('Erro geral ao criar pedido:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Buscar pedido por ID
router.get('/:id', (req, res) => {
  const { id } = req.params

  Order.findById(id, (err, order) => {
    if (err) {
      console.error('Erro ao buscar pedido:', err)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' })
    }

    res.json(order)
  })
})

// Listar pedidos (admin)
router.get('/', (req, res) => {
  Order.findAll((err, orders) => {
    if (err) {
      console.error('Erro ao buscar pedidos:', err)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }

    res.json(orders)
  })
})

// Atualizar status do pedido (admin)
router.put('/:id/status', (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!status) {
    return res.status(400).json({ message: 'Status é obrigatório' })
  }

  Order.updateStatus(id, status, (err) => {
    if (err) {
      console.error('Erro ao atualizar status:', err)
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }

    res.json({ message: 'Status atualizado com sucesso' })
  })
})

// Verificar status do pagamento
router.get('/:id/payment-status', async (req, res) => {
  try {
    const { id } = req.params

    Order.findById(id, async (err, order) => {
      if (err) {
        console.error('Erro ao buscar pedido:', err)
        return res.status(500).json({ message: 'Erro interno do servidor' })
      }

      if (!order || !order.payment_id) {
        return res
          .status(404)
          .json({ message: 'Pedido ou pagamento não encontrado' })
      }

      try {
        const paymentStatus = await mercadoPagoMock.getPayment(order.payment_id)

        // Atualizar status se mudou
        if (paymentStatus.status !== order.payment_status) {
          Order.updatePayment(
            id,
            { payment_status: paymentStatus.status },
            (err) => {
              if (err) {
                console.error('Erro ao atualizar status do pagamento:', err)
              } else if (paymentStatus.status === 'approved') {
                // Enviar email de aprovação
                Customer.findById(order.customer_id, (err, customer) => {
                  if (!err && customer) {
                    const orderData = {
                      order_number: order.order_number,
                      total_amount: order.total_amount
                    }
                    sendOrderStatusUpdateEmail(
                      orderData,
                      customer,
                      'approved'
                    ).catch((emailError) => {
                      console.error(
                        'Erro ao enviar email de aprovação:',
                        emailError
                      )
                    })
                  }
                })
              }
            }
          )
        }

        res.json({
          payment_id: order.payment_id,
          status: paymentStatus.status,
          status_detail: paymentStatus.status_detail,
          date_approved: paymentStatus.date_approved
        })
      } catch (paymentError) {
        console.error('Erro ao consultar pagamento:', paymentError)
        res
          .status(500)
          .json({ message: 'Erro ao consultar status do pagamento' })
      }
    })
  } catch (error) {
    console.error('Erro geral ao verificar pagamento:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

module.exports = router
