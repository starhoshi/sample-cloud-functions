import * as admin from 'firebase-admin'
import 'jest'
import * as Orderable from '@star__hoshi/orderable'
import { Pring } from 'pring'
import { FirebaseHelper } from './helper/firebase'
import * as Model from '../sampleModel'
import * as Shana from 'shana'

beforeAll(() => {
  const _ = FirebaseHelper.shared
})

it('order pay', async () => {
  jest.setTimeout(600000)

  const user = new Model.SampleUser()
  user.stripeCustomerID = 'cus_CC65RZ8Gf6zi7V'
  await user.save()

  const shop = new Model.SampleShop()
  shop.name = 'shop'
  await shop.save()

  const product1 = new Model.SampleProduct()
  product1.name = 'pro1'
  await product1.save()

  const product2 = new Model.SampleProduct()
  product2.name = 'pro2'
  await product2.save()

  const sku1 = new Model.SampleSKU()
  sku1.price = 100
  sku1.stockType = Orderable.StockType.Finite
  sku1.stock = 1000
  await sku1.save()
  const sku2 = new Model.SampleSKU()
  sku2.price = 400
  sku2.stockType = Orderable.StockType.Finite
  sku2.stock = 5000
  await sku2.save()

  const stripeCharge = new Model.SampleStripeCharge()
  stripeCharge.cardID = 'card_1BnhthKZcOra3JxsKaxABsRj'
  stripeCharge.customerID = user.stripeCustomerID

  const order = new Model.SampleOrder2()
  order.user = user.reference
  order.amount = 1000
  order.currency = 'jpy'
  order.paymentStatus = Orderable.OrderPaymentStatus.Created
  order.stripe = stripeCharge.rawValue()

  const orderSKU1 = new Model.SampleOrderSKU()
  orderSKU1.snapshotSKU = sku1.rawValue()
  orderSKU1.snapshotProduct = product1.rawValue()
  orderSKU1.quantity = 1
  orderSKU1.sku = sku1.reference
  orderSKU1.shop = shop.reference

  const orderSKU2 = new Model.SampleOrderSKU()
  orderSKU2.snapshotSKU = sku2.rawValue()
  orderSKU2.snapshotProduct = product2.rawValue()
  orderSKU2.quantity = 2000000000
  orderSKU2.sku = sku2.reference
  orderSKU2.shop = shop.reference

  const orderShop = new Model.SampleOrderShop()
  orderShop.orderSKUs.insert(orderSKU1)
  orderShop.orderSKUs.insert(orderSKU2)
  orderShop.paymentStatus = Orderable.OrderShopPaymentStatus.Created
  orderShop.user = user.reference
  orderShop.order = order.reference

  order.orderSKUs.insert(orderSKU1)
  order.orderSKUs.insert(orderSKU2)

  console.log('orderSKU1', orderSKU1.id)
  await orderShop.save()

  await order.save()
  console.log('order created', order.id)
  console.log('ordershop', orderShop.id)

  order.paymentStatus = Orderable.OrderPaymentStatus.PaymentRequested
  await order.update()

  await Shana.observe<any>(order.reference, (data, resolve, reject) => {
    if (data.neoTask && data.neoTask.status === 1) {
      return resolve()
    }
  })

  expect(true)
})
