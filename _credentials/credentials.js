module.exports = {
  //Jwts
  secret: process.env.JWT_SECRET,
  secretkey: process.env.JWT_SECRETKEY,

  //Databases
  postgres_un: process.env.POSTGRES_UN,
  postgres_pw: process.env.POSTGRES_PW,
  aws_secret_id: process.env.AWS_SECRETID,
  aws_secret_key: process.env.AWS_SECRETKEY,

  //Mail
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    username: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PASSWORD
  },
  
  //Services
  confluence_key: process.env.CONFLUENCEKEY,
  docobo: {
    outboundkey: process.env.DOCOBO_OUTBOUNDKEY || "",
    server: process.env.DOCOBO_SERVER || "",
    inboundkey: process.env.DOCOBO_INBOUNDKEY || ""
  }
}
