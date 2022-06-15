import { stat } from "fs";
import { Category } from "../../categories/shared/category.model";

export class Entry {
    constructor(
        public id?: Number,
        public name?: String,
        public description?: String,
        public type?: String,
        public amount?: String,
        public date?: String,
        public paid?: Boolean,
        public categoryId?: Number,
        public category?: Category,
    ) { }

    static types = {
        expense: 'despesa',
        renevue: 'Receita'
    };

    get paidText(): string{
        return this.paid ? 'Pago': 'Pendente';
    }

}