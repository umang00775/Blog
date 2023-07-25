const passport= require('passport');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

const GOOGLE_CLIENT_ID = "975978602577-d61ejingsjd5jugrolpc5qtftjtg3lsa.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

passport.serializeUser((user,done)=>{
    done(null, user);
});

passport.deserializeUser((user,done)=>{
    done(null, user);
});
