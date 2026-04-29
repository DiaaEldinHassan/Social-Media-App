import mongoose from "mongoose";

export type DeleteInput = {
  isDeleted?: boolean;
  deletedAt?: Date | null;
  deletedBy?: mongoose.Types.ObjectId | null;
};

export const ACTIVE_FILTER = { isDeleted: { $ne: true } };

export const applySoftDeleteQueryMiddleware = (schema: mongoose.Schema): void => {
  schema.pre(/^find/, function () {
    const query = this as any;
    const withDeleted = (query.getOptions() as { withDeleted?: boolean }).withDeleted;
    if (!withDeleted) {
      query.where(ACTIVE_FILTER);
    }
  });
};
