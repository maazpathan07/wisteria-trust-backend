import bcrypt from "bcryptjs";

const password = "Admin@123";

bcrypt.hash(password, 10).then(hash => {
  console.log("PASSWORD HASH:");
  console.log(hash);
});
