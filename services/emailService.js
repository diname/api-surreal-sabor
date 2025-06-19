const nodemailer = require('nodemailer')

// Configuração do transporter de email
const createTransporter = () => {
  // Para desenvolvimento, usar Ethereal Email (serviço de teste)
  // Em produção, configurar com Gmail, SendGrid, etc.

  if (process.env.NODE_ENV === 'production') {
    // Configuração para produção (exemplo com Gmail)
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  } else {
    // Configuração para desenvolvimento (mock)
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    })
  }
}

// Template de email de confirmação de pedido
const generateOrderConfirmationEmail = (orderData, customerData) => {
  const { order_number, total_amount, payment_method, items } = orderData
  const { full_name, email } = customerData

  const itemsList = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${
        item.quantity
      }</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">R$ ${item.unit_price.toFixed(
        2
      )}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">R$ ${(
        item.quantity * item.unit_price
      ).toFixed(2)}</td>
    </tr>
  `
    )
    .join('')

  const paymentMethodText = payment_method === 'pix' ? 'PIX' : 'Boleto Bancário'

  return {
    subject: `Confirmação de Pedido #${order_number} - Surreal Sabor`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmação de Pedido - Surreal Sabor</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background-color: #f97316; color: white; border-radius: 8px;">
          <h1 style="margin: 0; font-size: 28px;">🍽️ Surreal Sabor</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px;">Comida caseira com sabor inconfundível</p>
        </div>

        <!-- Saudação -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #f97316; margin-bottom: 10px;">Olá, ${full_name}!</h2>
          <p style="font-size: 16px; margin-bottom: 15px;">
            Seu pedido foi recebido com sucesso! Estamos preparando tudo com muito carinho para você.
          </p>
        </div>

        <!-- Informações do Pedido -->
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #f97316; margin-top: 0;">📦 Detalhes do Pedido</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Número do Pedido:</td>
              <td style="padding: 8px 0; text-align: right;">#${order_number}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Forma de Pagamento:</td>
              <td style="padding: 8px 0; text-align: right;">${paymentMethodText}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Status:</td>
              <td style="padding: 8px 0; text-align: right;">
                <span style="background-color: #fbbf24; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                  Aguardando Pagamento
                </span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Itens do Pedido -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #f97316;">🛒 Itens do Pedido</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background-color: #f97316; color: white;">
                <th style="padding: 12px 8px; text-align: left;">Produto</th>
                <th style="padding: 12px 8px; text-align: center;">Qtd</th>
                <th style="padding: 12px 8px; text-align: right;">Preço Unit.</th>
                <th style="padding: 12px 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
              <tr style="background-color: #f8f9fa; font-weight: bold;">
                <td colspan="3" style="padding: 12px 8px; text-align: right;">Total do Pedido:</td>
                <td style="padding: 12px 8px; text-align: right; color: #f97316; font-size: 18px;">
                  R$ ${total_amount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Próximos Passos -->
        <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #0277bd; margin-top: 0;">📋 Próximos Passos</h3>
          ${
            payment_method === 'pix'
              ? `
            <ol style="margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Realize o pagamento via PIX usando o código ou QR Code fornecido</li>
              <li style="margin-bottom: 8px;">Após a confirmação do pagamento, começaremos a preparar seu pedido</li>
              <li style="margin-bottom: 8px;">Você receberá uma nova confirmação quando o pedido estiver pronto</li>
            </ol>
          `
              : `
            <ol style="margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Imprima e pague o boleto bancário até o vencimento</li>
              <li style="margin-bottom: 8px;">Após a confirmação do pagamento (até 2 dias úteis), começaremos a preparar seu pedido</li>
              <li style="margin-bottom: 8px;">Você receberá uma nova confirmação quando o pedido estiver pronto</li>
            </ol>
          `
          }
        </div>

        <!-- Informações de Contato -->
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #f97316; margin-top: 0;">📞 Precisa de Ajuda?</h3>
          <p style="margin: 0;">
            <strong>Email:</strong> contato@surrealsabor.com.br<br>
            <strong>Telefone:</strong> (11) 99999-9999<br>
            <strong>Horário de Atendimento:</strong> Segunda a Sexta, 9h às 18h
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
          <p style="margin: 0 0 10px 0;">
            <strong>Surreal Sabor</strong> - Transformando cada refeição em um momento especial
          </p>
          <p style="margin: 0;">
            Este é um email automático, não responda a esta mensagem.
          </p>
        </div>

      </body>
      </html>
    `,
    text: `
      Olá, ${full_name}!

      Seu pedido foi recebido com sucesso!

      Detalhes do Pedido:
      - Número: #${order_number}
      - Total: R$ ${total_amount.toFixed(2)}
      - Pagamento: ${paymentMethodText}
      - Status: Aguardando Pagamento

      Itens do Pedido:
      ${items
        .map(
          (item) =>
            `- ${item.name} (${item.quantity}x) - R$ ${(
              item.quantity * item.unit_price
            ).toFixed(2)}`
        )
        .join('\n')}

      Próximos passos:
      ${
        payment_method === 'pix'
          ? '1. Realize o pagamento via PIX\n2. Aguarde a confirmação\n3. Seu pedido será preparado'
          : '1. Pague o boleto bancário\n2. Aguarde a confirmação (até 2 dias úteis)\n3. Seu pedido será preparado'
      }

      Dúvidas? Entre em contato:
      Email: contato@surrealsabor.com.br
      Telefone: (11) 99999-9999

      Obrigado por escolher a Surreal Sabor!
    `
  }
}

// Função para enviar email de confirmação
const sendOrderConfirmationEmail = async (orderData, customerData) => {
  try {
    const transporter = createTransporter()
    const emailContent = generateOrderConfirmationEmail(orderData, customerData)

    const mailOptions = {
      from: {
        name: 'Surreal Sabor',
        address: process.env.EMAIL_FROM || 'noreply@surrealsabor.com.br'
      },
      to: customerData.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    }

    const result = await transporter.sendMail(mailOptions)

    console.log('Email de confirmação enviado:', {
      messageId: result.messageId,
      to: customerData.email,
      orderNumber: orderData.order_number
    })

    // Para desenvolvimento, mostrar preview URL se disponível
    if (process.env.NODE_ENV !== 'production' && result.previewURL) {
      console.log('Preview URL:', result.previewURL)
    }

    return {
      success: true,
      messageId: result.messageId,
      previewURL: result.previewURL
    }
  } catch (error) {
    console.error('Erro ao enviar email de confirmação:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Template de email de atualização de status
const sendOrderStatusUpdateEmail = async (
  orderData,
  customerData,
  newStatus
) => {
  try {
    const transporter = createTransporter()

    const statusMessages = {
      approved: {
        subject: `Pagamento Confirmado - Pedido #${orderData.order_number}`,
        title: '✅ Pagamento Confirmado!',
        message:
          'Seu pagamento foi confirmado e seu pedido está sendo preparado com carinho.',
        color: '#10b981'
      },
      preparing: {
        subject: `Pedido em Preparo - #${orderData.order_number}`,
        title: '👨‍🍳 Preparando seu Pedido',
        message:
          'Nossos chefs estão preparando seus pratos com todo o carinho.',
        color: '#f59e0b'
      },
      ready: {
        subject: `Pedido Pronto - #${orderData.order_number}`,
        title: '🎉 Pedido Pronto!',
        message:
          'Seu pedido está pronto! Entre em contato para combinar a retirada.',
        color: '#10b981'
      },
      cancelled: {
        subject: `Pedido Cancelado - #${orderData.order_number}`,
        title: '❌ Pedido Cancelado',
        message:
          'Seu pedido foi cancelado. Se você tem dúvidas, entre em contato conosco.',
        color: '#ef4444'
      }
    }

    const statusInfo = statusMessages[newStatus] || statusMessages['approved']

    const mailOptions = {
      from: {
        name: 'Surreal Sabor',
        address: process.env.EMAIL_FROM || 'noreply@surrealsabor.com.br'
      },
      to: customerData.email,
      subject: statusInfo.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${statusInfo.subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background-color: ${
            statusInfo.color
          }; color: white; border-radius: 8px;">
            <h1 style="margin: 0; font-size: 28px;">🍽️ Surreal Sabor</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Atualização do seu pedido</p>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: ${statusInfo.color}; margin-bottom: 10px;">${
        statusInfo.title
      }</h2>
            <p style="font-size: 16px;">Olá, ${customerData.full_name}!</p>
            <p style="font-size: 16px;">${statusInfo.message}</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: ${
              statusInfo.color
            }; margin-top: 0;">📦 Informações do Pedido</h3>
            <p><strong>Número:</strong> #${orderData.order_number}</p>
            <p><strong>Total:</strong> R$ ${orderData.total_amount.toFixed(
              2
            )}</p>
            <p><strong>Status:</strong> ${statusInfo.title}</p>
          </div>

          <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">
              <strong>Surreal Sabor</strong> - Transformando cada refeição em um momento especial
            </p>
            <p style="margin: 0;">
              Dúvidas? Entre em contato: contato@surrealsabor.com.br | (11) 99999-9999
            </p>
          </div>

        </body>
        </html>
      `
    }

    const result = await transporter.sendMail(mailOptions)

    console.log('Email de atualização enviado:', {
      messageId: result.messageId,
      to: customerData.email,
      orderNumber: orderData.order_number,
      status: newStatus
    })

    return {
      success: true,
      messageId: result.messageId
    }
  } catch (error) {
    console.error('Erro ao enviar email de atualização:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
}
