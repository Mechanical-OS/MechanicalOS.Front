export interface ChatMessage {
    id: number;
    sender: {
        name: string;
        avatar: string;
    }
    time: string;
    message: string;
}