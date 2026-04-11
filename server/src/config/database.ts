import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_management';
    await mongoose.connect(mongoURI);

    // Reconcile legacy fee.transactionId index to prevent duplicate key on null values.
    try {
      const feesCollection = mongoose.connection.collection('fees');
      let indexes: Awaited<ReturnType<typeof feesCollection.indexes>> = [];
      try {
        indexes = await feesCollection.indexes();
      } catch (listErr: unknown) {
        // Collection not created yet — listIndexes fails with NamespaceNotFound (26).
        const code = (listErr as { code?: number; codeName?: string })?.code;
        const codeName = (listErr as { codeName?: string })?.codeName;
        if (code !== 26 && codeName !== 'NamespaceNotFound') throw listErr;
      }
      const hasLegacyTxIndex = indexes.some((idx) => idx.name === 'transactionId_1');

      if (hasLegacyTxIndex) {
        await feesCollection.dropIndex('transactionId_1');
      }

      await feesCollection.createIndex(
        { transactionId: 1 },
        {
          name: 'transactionId_1',
          unique: true,
          sparse: true,
        }
      );
    } catch (indexError) {
      console.error('Fee transactionId index reconciliation warning:', indexError);
    }

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
