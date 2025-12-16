// Python backend'inizdeki ItemCreate, ItemUpdate, ItemResponse schema'larına uygun tipler
// Item ismi yerine User olarak kullanılacak

export type RegisterRequest = {
    title: string; // fullName olarak kullanılacak
    description: string; // email|password formatında saklanacak (geçici çözüm)
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type UserResponse = {
    id: number;
    title: string;
    description: string;
};

export type AuthResponse = {
    user: UserResponse;
    token?: string;
};

// Form data tiplerini API'ye dönüştürmek için yardımcı tipler
export type RegisterFormData = {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
};

export type LoginFormData = {
    email: string;
    password: string;
};
