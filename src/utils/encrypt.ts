import bcrypt from "bcryptjs";

export const encrypt = async (password: string) => {
    const encryptedPassword = await bcrypt.hash(password, 10);
    return encryptedPassword;
}

export const compare = async (password: string, encryptedPassword: string) => {
    const isMatch = await bcrypt.compare(password, encryptedPassword);
    return isMatch;
}

// (async () => {

//     const password = "admin123";
    
//     const encrypted = await encrypt(password)
    
//     console.log("🚀 ~ password:", password)
//     console.log("🚀 ~ encrypted:", encrypted)

//     const verified = await compare(password, encrypted)

//     console.log("🚀 ~ verified:", verified)
// })()