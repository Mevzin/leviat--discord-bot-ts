import mongoose, { Schema, Document } from 'mongoose';

interface IUserFarm extends Document {
    userId: string;
    tintas: number;
    papeis: number;
}

const UserFarmSchema = new Schema<IUserFarm>({
    userId: { type: String, required: true, unique: true },
    tintas: { type: Number, default: 0 },
    papeis: { type: Number, default: 0 },
});

const UserFarm = mongoose.model<IUserFarm>('UserFarm', UserFarmSchema);
export default UserFarm;
