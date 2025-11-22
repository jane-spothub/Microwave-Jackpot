// types.ts
export type LotteryNumber= {
    value: number;
    selected: boolean;
}

export type Draw= {
    id: string;
    date: Date;
    winningNumbers: number[];
}

export type Ticket= {
    id: string;
    numbers: number[];
    drawId: string;
    purchaseDate: Date;
}