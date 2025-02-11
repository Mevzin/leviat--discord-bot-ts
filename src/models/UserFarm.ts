import mongoose, { Schema, Document } from 'mongoose';

interface IUserFarm extends Document {
    userId: string;
    recibos: number;
}

const UserFarmSchema = new Schema<IUserFarm>({
    userId: { type: String, required: true, unique: true },
    recibos: { type: Number, default: 0 },
});

const UserFarm = mongoose.model<IUserFarm>('UserFarm', UserFarmSchema);
export default UserFarm;
