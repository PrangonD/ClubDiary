const mongoose = require("mongoose");
const mongoConnectOptions = require("./mongoConnectOptions");

let isConnected = false;
let lastError = "";
let retryTimer = null;

function getDbState() {
  return {
    isConnected,
    state: mongoose.connection.readyState,
    lastError
  };
}

async function connectDB() {
  if (!process.env.MONGO_URI) {
    lastError = "MONGO_URI is missing";
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, mongoConnectOptions);
    isConnected = true;
    lastError = "";
    return true;
  } catch (error) {
    isConnected = false;
    lastError = error.message;
    return false;
  }
}

function startDbRetry({ initialDelayMs = 0, retryEveryMs = 10000 } = {}) {
  const attempt = async () => {
    const ok = await connectDB();
    if (ok) {
      console.log("MongoDB connected");
      if (retryTimer) {
        clearInterval(retryTimer);
        retryTimer = null;
      }
      return;
    }

    console.error("Database connection failed:", lastError);
    if (!retryTimer) {
      retryTimer = setInterval(async () => {
        const retryOk = await connectDB();
        if (retryOk) {
          console.log("MongoDB reconnected");
          clearInterval(retryTimer);
          retryTimer = null;
        } else {
          console.error("MongoDB retry failed:", lastError);
        }
      }, retryEveryMs);
    }
  };

  if (initialDelayMs > 0) setTimeout(attempt, initialDelayMs);
  else void attempt();
}

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  lastError = "MongoDB disconnected";
  console.error(lastError);
});

mongoose.connection.on("error", (err) => {
  isConnected = false;
  lastError = err.message;
  console.error("MongoDB error:", err.message);
});

module.exports = { startDbRetry, getDbState };
