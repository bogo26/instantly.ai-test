import Knex from 'knex';

export const knex = Knex({
  client: 'sqlite3', // or 'better-sqlite3'
  connection: {
    filename: './dev.sqlite3',
  },
  useNullAsDefault: true
});

export class DB {
  static async addEmail(data) {
    return knex('emails').insert(data);
  }
  
  static async getEmails() {
    return knex('emails').select('*').orderBy('created_at', 'desc');
  }
  
  static async getEmail(id) {
    return knex('emails').where('id', id).first();
  }
}
