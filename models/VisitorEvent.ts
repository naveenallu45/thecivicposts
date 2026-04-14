import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IVisitorEvent extends Document {
  visitorId?: string
  article?: mongoose.Types.ObjectId
  slug?: string
  createdAt: Date
  updatedAt: Date
}

const VisitorEventSchema: Schema = new Schema(
  {
    visitorId: {
      type: String,
      trim: true,
      index: true,
    },
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
VisitorEventSchema.index({ visitorId: 1, slug: 1 }, { unique: true, sparse: true })

const VisitorEvent: Model<IVisitorEvent> =
  mongoose.models.VisitorEvent || mongoose.model<IVisitorEvent>('VisitorEvent', VisitorEventSchema)

export default VisitorEvent
