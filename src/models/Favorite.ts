import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFavorite extends Document {
  userId: Types.ObjectId;
  boatId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    boatId: {
      type: Schema.Types.ObjectId,
      ref: 'Boat',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

FavoriteSchema.index({ userId: 1, boatId: 1 }, { unique: true });

export const Favorite =
  mongoose.models.Favorite ||
  mongoose.model<IFavorite>('Favorite', FavoriteSchema);
