import bcrypt from "bcryptjs";

export const encrypt = async (password: string) => {
    const encryptedPassword = await bcrypt.hash(password, 10);
    return encryptedPassword;
}

export const compare = async (password: string, encryptedPassword: string) => {
    const isMatch = await bcrypt.compare(password, encryptedPassword);
    return isMatch;
}
