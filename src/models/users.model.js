/**
 * User Model
 */
import db from '../config/database';
import { Schema, Types } from 'mongoose';
import constants from '../config/constants';
import { hashSync, compareSync } from 'bcrypt-nodejs';

let UserSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
        },
        contact: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            sparse: true,
        },
        lastLogin: Date,
        status: Number,
        password: {
            type: String,
        },
    },
    {
        versionKey: false,
        timestamps: true,
    },
);

let User = db.model('User', UserSchema);

export async function register(body) {
    body.password = hashSync(body.password);
    body.status = constants.status.user.active;
    body.lastLogin = new Date()
    let newUser = await User.create(body);
    return newUser;
}

export async function authenticate(email, password) {
    let user = await User.findOne({ $or: [{ email: email }, { contact: email }] }).exec();
    if (user) {
        if (user.status === constants.status.user.inactive) {
            throw 'Account is Inactive';
        } else if (user.status === constants.status.user.deleted) {
            throw 'User not found';
        } else {
            if (user.status === constants.status.user.active && user.password) {
                if (compareSync(password, user.password)) {
                    user.lastLogin = new Date();
                    user.save();
                    return user;
                } else {
                    throw 'Incorrect Password!!!';
                }
            }
        }
    } else throw 'User not found';
}

export async function getUser(body) {
    let users = await User.findOne({ $or: [{ contact: body.contact }, { email: body.email }] });
    return users;
}