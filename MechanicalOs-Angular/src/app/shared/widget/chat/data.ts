import { ChatMessage } from "./chat.model";

//chat widget message list
const CHATMESSAGES: ChatMessage[] = [
    {
        id: 1,
        sender: {
            name: 'Geneva',
            avatar: 'assets/images/users/user-5.jpg',
        },
        time: '10:00',
        message: 'Hello!'
    },
    {
        id: 2,
        sender: {
            name: 'Dominic',
            avatar: 'assets/images/users/user-1.jpg',
        },
        time: '10:01',
        message: 'Hi, How are you? What about our next meeting?'
    },
    {
        id: 3,
        sender: {
            name: 'Geneva',
            avatar: 'assets/images/users/user-5.jpg',
        },
        time: '10:02',
        message: 'Yeah everything is fine'
    },
    {
        id: 4,
        sender: {
            name: 'Dominic',
            avatar: 'assets/images/users/user-1.jpg'
        },
        time: '10:03',
        message: 'Wow that\'s great'
    }
];


export { CHATMESSAGES };