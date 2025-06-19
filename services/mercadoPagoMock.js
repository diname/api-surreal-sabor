// Mock do Mercado Pago para desenvolvimento
// Em produção, substituir pela SDK oficial do Mercado Pago

class MercadoPagoMock {
  constructor(accessToken) {
    this.accessToken = accessToken
    this.baseUrl = 'https://api.mercadopago.com' // URL real para referência
  }

  // Simular criação de preferência de pagamento
  async createPreference(preferenceData) {
    const { items, payer, payment_methods, back_urls, notification_url } =
      preferenceData

    // Simular resposta do Mercado Pago
    const mockResponse = {
      id: 'PREF_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      init_point: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=PREF_${Date.now()}`,
      sandbox_init_point: `https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=PREF_${Date.now()}`,
      items: items,
      payer: payer,
      payment_methods: payment_methods,
      back_urls: back_urls,
      notification_url: notification_url,
      date_created: new Date().toISOString(),
      date_of_expiration: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString(), // 24h
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString()
    }

    return mockResponse
  }

  // Simular criação de pagamento PIX
  async createPixPayment(paymentData) {
    const { transaction_amount, description, payment_method_id, payer } =
      paymentData

    // Gerar QR Code PIX simulado
    const pixKey = 'pix@surrealsabor.com.br'
    const pixCode = this.generatePixCode(
      transaction_amount,
      description,
      pixKey
    )

    const mockResponse = {
      id: 'PIX_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      status_detail: 'pending_waiting_payment',
      payment_method_id: 'pix',
      payment_type_id: 'bank_transfer',
      transaction_amount: transaction_amount,
      description: description,
      payer: payer,
      date_created: new Date().toISOString(),
      date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
      point_of_interaction: {
        type: 'PIX',
        application_data: {
          name: 'Surreal Sabor',
          version: '1.0'
        },
        transaction_data: {
          qr_code_base64: this.generateQRCodeBase64(pixCode),
          qr_code: pixCode,
          ticket_url: `https://www.mercadopago.com.br/payments/${Date.now()}/ticket?caller_id=123456&hash=abc123`
        }
      }
    }

    return mockResponse
  }

  // Simular criação de boleto
  async createBoletoPayment(paymentData) {
    const { transaction_amount, description, payment_method_id, payer } =
      paymentData

    const mockResponse = {
      id: 'BOL_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      status_detail: 'pending_waiting_payment',
      payment_method_id: 'bolbradesco',
      payment_type_id: 'ticket',
      transaction_amount: transaction_amount,
      description: description,
      payer: payer,
      date_created: new Date().toISOString(),
      date_of_expiration: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000
      ).toISOString(), // 3 dias
      transaction_details: {
        external_resource_url: `https://www.mercadopago.com.br/payments/${Date.now()}/ticket?caller_id=123456&hash=abc123`,
        installment_amount: transaction_amount,
        financial_institution: 'Bradesco',
        payment_method_reference_id: this.generateBoletoBarcode()
      }
    }

    return mockResponse
  }

  // Simular consulta de pagamento
  async getPayment(paymentId) {
    // Simular diferentes status baseado no tempo
    const createdTime = parseInt(paymentId.split('_')[1])
    const now = Date.now()
    const timeDiff = now - createdTime

    let status = 'pending'
    let status_detail = 'pending_waiting_payment'

    // Simular aprovação automática após 2 minutos (para testes)
    if (timeDiff > 2 * 60 * 1000) {
      status = 'approved'
      status_detail = 'accredited'
    }

    const mockResponse = {
      id: paymentId,
      status: status,
      status_detail: status_detail,
      date_approved: status === 'approved' ? new Date().toISOString() : null,
      date_created: new Date(createdTime).toISOString(),
      last_modified: new Date().toISOString()
    }

    return mockResponse
  }

  // Gerar código PIX simulado
  generatePixCode(amount, description, pixKey) {
    const payload = {
      pixKey: pixKey,
      amount: amount.toFixed(2),
      description: description,
      merchantName: 'Surreal Sabor',
      merchantCity: 'SAO PAULO',
      txid: 'SS' + Date.now()
    }

    // Código PIX simplificado para demonstração
    return `00020126580014BR.GOV.BCB.PIX0136${pixKey}0208${description}5204000053039865802BR5913Surreal Sabor6009SAO PAULO62070503***6304`
  }

  // Gerar QR Code base64 simulado
  generateQRCodeBase64(pixCode) {
    // Em produção, usar biblioteca como qrcode para gerar QR real
    // Por enquanto, retornar um placeholder base64
    return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  }

  // Gerar código de barras do boleto simulado
  generateBoletoBarcode() {
    const bank = '237' // Bradesco
    const dueDate = Math.floor((Date.now() + 3 * 24 * 60 * 60 * 1000) / 1000) // 3 dias
    const amount = Math.floor(Math.random() * 100000) // Valor simulado
    const sequence = Math.floor(Math.random() * 10000000)

    return `${bank}${dueDate}${amount.toString().padStart(10, '0')}${sequence
      .toString()
      .padStart(7, '0')}`
  }

  // Simular webhook de notificação
  simulateWebhook(paymentId, status = 'approved') {
    return {
      id: parseInt(paymentId.split('_')[1]),
      live_mode: false,
      type: 'payment',
      date_created: new Date().toISOString(),
      application_id: '123456789',
      user_id: '987654321',
      version: 1,
      api_version: 'v1',
      action: 'payment.updated',
      data: {
        id: paymentId
      }
    }
  }
}

// Configuração do Mercado Pago Mock
const mercadoPagoMock = new MercadoPagoMock(
  process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-123456789'
)

module.exports = {
  MercadoPagoMock,
  mercadoPagoMock
}
