import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPublisher extends Document {
  name: string
  email: string
  password: string
  avatar?: string
  createdBy: mongoose.Types.ObjectId // Author or Admin who created this publisher
  createdByRole: 'admin' | 'author' // Role of creator
  createdAt: Date
  updatedAt: Date
}

const PublisherSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Publisher name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Publisher email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    avatar: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      // Store ObjectId reference - no populate needed since we only track who created it
    },
    createdByRole: {
      type: String,
      required: true,
      enum: ['admin', 'author'],
    },
  },
  {
    timestamps: true,
  }
)

const Publisher: Model<IPublisher> =
  mongoose.models.Publisher || mongoose.model<IPublisher>('Publisher', PublisherSchema)

export default Publisher
