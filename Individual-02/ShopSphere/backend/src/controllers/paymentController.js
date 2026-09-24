// backend/src/controllers/paymentController.js
import { initiatePayment, verifyAndRecordPayment } from '../services/paymentService.js';

export async function createPayment(req, res, next) {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    const userId = req.user ? req.user._id : 'demo_user';

    const paymentInfo = await initiatePayment({ amount, currency, receipt, userId });
    res.json({
      success: true,
      message: 'Payment session initialized in development mode',
      data: paymentInfo,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const { orderId, amount, transactionId, simulateSuccess = true } = req.body;
    const userId = req.user ? req.user._id : 'demo_user';

    const payment = await verifyAndRecordPayment({
      orderId,
      userId,
      amount,
      transactionId,
      simulateSuccess,
    });

    res.json({
      success: true,
      message: 'Payment verified and marked as captured',
      data: { payment },
    });
  } catch (err) {
    next(err);
  }
}
