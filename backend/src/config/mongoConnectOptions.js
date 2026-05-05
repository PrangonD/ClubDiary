/**
 * Options for Mongoose when using MongoDB Atlas (and local dev).
 * `family: 4` prefers IPv4 — avoids many Atlas TLS / ReplicaSetNoPrimary
 * issues on Windows where IPv6 or DNS resolution misbehaves.
 */
module.exports = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  family: 4
};
