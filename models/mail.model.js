

import { Schema, model } from "mongoose";


const mailInfoSchema = new Schema({
    log: {
        type: String,
        required: true
    },
    emailID: {
        type: String,
        required: true
    }

}, {timestamps: true})


export const MailInfo = model('MailInfo', mailInfoSchema)