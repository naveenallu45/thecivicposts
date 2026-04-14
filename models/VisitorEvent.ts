import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IVisitorEvent extends Document {
  article?: mongoose.Types.ObjectId
  slug?: string
  createdAt: Date
  updatedAt: Date
}

const VisitorEventSchema: Schema = new Schema(
  {
    article: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      index: true,
    },
    slug: {
      type: String,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

VisitorEventSchema.index({ createdAt: -1 })

const VisitorEvent: Model<IVisitorEvent> =
  mongoose.models.VisitorEvent || mongoose.model<IVisitorEvent>('VisitorEvent', VisitorEventSchema)

export default VisitorEvent
