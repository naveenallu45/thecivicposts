import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAuthor extends Document {
  name: string
  email: string
  bio?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

const AuthorSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Author email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

const Author: Model<IAuthor> =
  mongoose.models.Author || mongoose.model<IAuthor>('Author', AuthorSchema)

export default Author
