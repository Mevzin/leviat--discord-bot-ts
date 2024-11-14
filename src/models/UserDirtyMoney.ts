import mongoose, { Schema, Document } from 'mongoose';

interface IUserDirtyMoney extends Document {
    userId: string;
    amount: number;
}

const UserDirtyMoneySchema = new Schema<IUserDirtyMoney>({
    userId: { type: String, required: true, unique: true },
    amount: { type: Number, default: 0 },
});

const UserDirtyMoney = mongoose.model<IUserDirtyMoney>('UserDirtyMoney', UserDirtyMoneySchema);
export default UserDirtyMoney;
