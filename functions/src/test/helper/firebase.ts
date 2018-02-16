import * as admin from 'firebase-admin'
import { Pring } from 'pring'
import * as Orderable from '@star__hoshi/orderable'

export class FirebaseHelper {
  private static _shared?: FirebaseHelper
  private constructor() { }
  static get shared(): FirebaseHelper {
    if (!this._shared) {
      this._shared = new FirebaseHelper()

      const serviceAccount = require('../../../../../sandbox-329fc-firebase-adminsdk.json')
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })

      Pring.initialize({
        projectId: 'sandbox-329fc',
        keyFilename: '../../sandbox-329fc-firebase-adminsdk.json'
      })

      Orderable.initialize({
        adminOptions: {
          projectId: 'sandbox-329fc',
          keyFilename: '../../sandbox-329fc-firebase-adminsdk.json'
        },
        stripeToken: ''
      })
    }

    return this._shared
  }
}
