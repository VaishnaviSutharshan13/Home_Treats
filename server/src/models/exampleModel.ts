import { Schema, model, Document } from 'mongoose';

interface IExample extends Document {
  name: string;
  createdAt: Date;
}

const ExampleSchema = new Schema<IExample>({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model<IExample>('Example', ExampleSchema);
