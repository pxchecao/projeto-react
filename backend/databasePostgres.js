import { randomUUID } from "node:crypto";
import { sql } from './sql.js';
import bcrypt from 'bcrypt';


export class DatabasePostgres {
    async list() {
        try{
            const result = await sql`SELECT * FROM users;`;
            return result;
        } catch (err){
            console.log("Erro ao listar usuários: ", err);
            return [];
        }
    }


    async create(user) {
    const userId = randomUUID();
    const { name, email, password } = user;
    const hashedPassword = await bcrypt.hash(password, 10);


       
        await sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${userId}, ${name}, ${email}, ${hashedPassword})
        `;
    }


    async findByEmail(email) {
        const result = await sql`SELECT * FROM users WHERE email = ${email};`;
        return result[0];
    }


    async update(id, user){
        const { name, email } = user;
        await sql`
            UPDATE users
            SET name = ${name}, email = ${email}
            WHERE id = ${id}
        `;
    }


    async delete(id){
        await sql`DELETE FROM users WHERE id = ${id}`;
    }
}


