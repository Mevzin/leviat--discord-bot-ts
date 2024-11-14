import mongoose, { Schema, Document } from 'mongoose';

interface IUserDirtyMoney extends Document {
    userId: string;
    dirtyMoney: number;
}

const UserDirtyMoneySchema = new Schema<IUserDirtyMoney>({
    userId: { type: String, required: true, unique: true },
    dirtyMoney: { type: Number, default: 0 },
});

const UserDirtyMoney = mongoose.model<IUserDirtyMoney>('UserDirtyMoney', UserDirtyMoneySchema);
export default UserDirtyMoney;
