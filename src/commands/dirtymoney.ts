import UserDirtyMoney from "src/models/UserDirtyMoney";


async function updateDirtyMoney(userId: string, amount: number) {
    const amountToUpdate = Math.max(0, amount);

    const amountFarm = await UserDirtyMoney.findOneAndUpdate({ userId }, { $inc: { amount: (amountToUpdate) } }, { new: true, upsert: true })
    return amountFarm;
}

async function removeDirtyMoney(userId: string, amount: number) {
    const amountToUpdate = Math.max(0, amount);

    const amountFarm = await UserDirtyMoney.findOneAndUpdate(
        { userId },
        { $inc: { amount: -(amountToUpdate) } },
        { new: true, upsert: true })
    return amountFarm;
}
export default async function dirtyMoneyCommands(commandName: string, options: any, interaction: any) { }