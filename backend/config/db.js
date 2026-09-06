const { connectSupabase } = require('./supabase');

const connectDB = async () => {
  return await connectSupabase();
};

module.exports = connectDB;
