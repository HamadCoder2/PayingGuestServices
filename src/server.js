require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const flash = require("express-flash")
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const LocalStrategy = require("passport-local").Strategy;



const app = express();
app.use(express.static("public"));


app.set('view engine', 'ejs');

app.use(bodyParser.json()); // for parsing JSON data
app.use(bodyParser.urlencoded({ extended: false }));


app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    // store: store,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days in milliseconds
    }
}));




app.use(passport.initialize());
app.use(passport.session());
app.use(flash());





// mongoose.connect("mongodb://localhost:27017/PGlife", { useNewUrlParser: true }, { useCreateIndex: true });
const db = process.env.MONGO_URI
mongoose.connect(db, {
    writeConcern: { w: 'majority', wtimeout: 0 },
})
    .then(() => {
        console.log("Connection successfully");
    })
    .catch((err) => console.log("Connection failed:", err));

const userSchema = new mongoose.Schema({
    username: String,
    fullname: String,
    phone: Number,
    email: String,
    password: String,
    gender: String

});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.serializeUser((user, done) => {
    if (user) {
        return done(null, user.id);
    } else {
        return done(null, false);
    }
});
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        if (err) {
            return done(err, user);
        } else {
            return done(null, user);
        }
    });
});

// routes 
app.get("/", function (req, res) {
    res.render("home", { user: req.user, indexproperties: indexproperties });
});

app.get("/property_list", function (req, res) {
    res.render("property_list", { user: req.user, cityProperties: cityProperties });
});

app.get("/property_detail", function (req, res) {
    res.render("property_detail", { property: property });
});

app.get("/checkout", function (req, res) {
    res.render("checkout");
});

app.get("/signin", function (req, res) {
    res.render("signin", { user: req.user });
});

app.get("/login", function (req, res) {
    res.render("login", { user: req.user });
});

app.get("/dashboard", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("dashboard", { user: req.user });
    } else {
        res.redirect("/login");
    }
});


app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'You have successfully logged out!');
        res.redirect("/");
    });
});


app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});



// for signin 
app.post("/signin", function (req, res) {
    User.register({ username: req.body.username, fullname: req.body.fullname, phone: req.body.phone, email: req.body.username, gender: req.body.gender }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            req.flash('error', 'User already registered with this Email id');
            res.redirect("/signin",);
        } else {
            passport.authenticate("local")(req, res, function () {
                req.flash('success', "Registration successful. Welcome, " + user.fullname + "!");
                res.redirect("/dashboard");
            });
        }
    });
});


//  for login 
app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function (err) {
        if (err) {
            console.error("Login error:", err);
            req.flash('error', 'Internal Server Error.');
            return res.redirect("/login");
        } else {
            passport.authenticate("local")(req, res, function () {
                req.flash('success', "login successful. ");
                res.redirect("/dashboard");
            });
        }
    });
});



// for edit profile page  
app.get("/edit/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.render("editpage", { user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post("/edit/:id", async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, req.body);
        res.redirect("/dashboard");
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});





// Mock data for properties in different cities
const cityProperties = {

    mumbai: [
        {
            id: '1',
            city: 'mumbai',
            name: 'Captain Nadar paying guest',
            address: 'A 12 sakinaka housing society Josh nagar karani road,Mumbai',
            img: '/img/female.png',
            price: 6500,
            stars: 3.5,
            interestedCount: 0,
            gender: 'female',
            propertyimg: '/img/properties/1/pic14.jpg'

        },
        {
            id: '2',
            city: 'mumbai',
            name: 'Ganesh darshan Girls PG',
            address: 'Ganesh Darshan, Ghatkopar west,Opp Jain temple Mumbai',
            img: '/img/female.png',
            price: 8000,
            stars: 3.5,
            interestedCount: 0,
            gender: 'female',
            propertyimg: '/img/properties/1/pic15.jpg'
        },
        {
            id: '3',
            city: 'mumbai',
            name: 'Navkar Paying Guest',
            address: '44, Juhu Scheme, Juhu, Mumbai, Maharashtra 400058',
            img: '/img/unisex.png',
            price: 8000,
            stars: 3.5,
            interestedCount: 0,
            gender: 'unisex',
            propertyimg: '/img/properties/1/pic16.jpg'
        },
        {
            id: '4',
            city: 'mumbai',
            name: 'Ganpati Paying Guest',
            address: 'Plot no.258/D4, Gorai no.2, Borivali West, Mumbai, Maharashtra 400092',
            img: '/img/unisex.png',
            price: 5000,
            stars: 3.5,
            interestedCount: 0,
            gender: 'unisex',
            propertyimg: '/img/properties/1/pic17.jpg'

        },
        {
            id: '5',
            city: 'mumbai',
            name: 'Mumbai PG Touchwood Hospitalities',
            address: 'Yamuna apartments,, 45 cross Telly gally,Andheri Railway station east, Mumbai',
            img: '/img/unisex.png',
            price: 3000,
            stars: 3.5,
            interestedCount: 0,
            gender: 'unisex',
            propertyimg: '/img/properties/1/pic18.jpeg'
        },
        {
            id: '6',
            city: 'mumbai',
            name: 'PG Accommodation For Girls',
            address: 'B15 mytri park, bn purav marg, Chembur mytri park, Mumbai',
            img: '/img/female.png',
            price: 5000,
            stars: 3.5,
            interestedCount: 0,
            gender: 'female',
            propertyimg: '/img/properties/1/pic20.jpeg'
        }
    ],
    delhi: [

        {
            id: '1',
            city: 'delhi',
            name: 'Navrang PG Home',
            address: '644-C,Mohalla Baoli 6 Tooti Chowk, Paharganj, New Delhi, Delhi 110055',
            img: '/img/unisex.png',
            price: 6000,
            stars: 3.5,
            interestedCount: 0,
            gender: 'unisex',
            propertyimg: '/img/properties/1/pic13.png'
        },
        {
            id: '2',
            city: 'delhi',
            name: 'GreenView Mess',
            address: 'patel nagar, delhi',
            img: '/img/unisex.png',
            price: 5000,
            stars: 3.5,
            interestedCount: 0,
            gender: 'unisex',
            propertyimg: '/img/properties/1/pic11.jpg'
        },
        {
            id: '3',
            city: 'delhi',
            name: 'Saxena  Paying Guest',
            address: 'H.No. 3958 Kaseru Walan, Pahar Ganj, New Delhi, Delhi 110055',
            img: '/img/unisex.png',
            price: 5000,
            stars: 3.5,
            interestedCount: 0,
            gender: 'unisex',
            propertyimg: '/img/properties/1/pic5.avif'
        },

    ],
    bangalore: [

        {
            id: '1',
            city: 'bangalore',
            name: 'Hariom Paying Guest',
            address: 'Yalanka, Bangalore',
            img: '/img/male.png',
            price: 8000,
            stars: 3.5,
            interestedCount: 0,
            gender: 'male',
            propertyimg: '/img/properties/1/pic19.jpg'
        },
        {
            id: '2',
            city: 'bangalore',
            name: 'chatham',
            address: 'marathalali , Bangalore',
            img: '/img/unisex.png',
            price: 5000,
            stars: 3.5,
            interestedCount: 0,
            gender: 'unisex',
            propertyimg: '/img/properties/1/pic21.jpeg'
        }
    ],
    kolkata: [

        {
            id: '1',
            city: 'kolkata',
            name: 'kachenjunga mess',
            address: 'Mahisbathan, Salt Lake',
            img: '/img/unisex.png',
            price: 8000,
            stars: 3.5,
            interestedCount: 0,
            gender: 'unisex',
            propertyimg: '/img/properties/1/pic22.jpeg'
        },
        {
            id: '2',
            city: 'kolkata',
            name: 'Calcutta Ladies Lodge ',
            address: 'bose street khanna,kolkata',
            img: '/img/unisex.png',
            price: 5000,
            stars: 3.5,
            interestedCount: 0,
            gender: 'unisex',
            propertyimg: '/img/properties/1/pic23.jpeg'
        }
    ],
    chennai: [

        {
            id: '1',
            city: 'chennai',
            name: 'Ashwini Working Womens  P.G',
            address: 'Alwarpet Cooperative Colony, Chennai',
            img: '/img/female.png',
            price: 8000,
            stars: 3.5,
            interestedCount: 0,
            gender: 'female',
            propertyimg: '/img/properties/1/pic24.jpeg'
        },
        {
            id: '2',
            city: 'chennai',
            name: 'Guardian Guest House ',
            address: 'Triplicane Near Star Theatre, Chennai',
            img: '/img/unisex.png',
            price: 5000,
            stars: 3.5,
            interestedCount: 0,
            gender: 'unisex',
            propertyimg: '/img/properties/1/pic25.jpeg'
        },
        {
            id: '3',
            city: 'chennai',
            name: 'SNK WOMENS PG',
            address: 'gandhi road , Choolaimedu, CHENNAI, CHENNAI',
            img: '/img/female.png',
            price: 3000,
            stars: 3.5,
            interestedCount: 0,
            gender: 'female',
            propertyimg: '/img/properties/1/pic26.jpeg'
        },
        {
            id: '4',
            city: 'chennai',
            name: 'Surya Womens Hostel -IV',
            address: 'Egmore,P.L.O Main Road, Chennai',
            img: '/img/female.png',
            price: 5000,
            stars: 3.5,
            interestedCount: 0,
            gender: 'female',
            propertyimg: '/img/properties/1/pic27.jpeg'
        }
    ]
};

const indexproperties = [
    {
        id: '1',
        city: 'mumbai',
        name: 'Ganpati Paying Guest',
        address: 'Plot no.258/D4, Gorai no.2, Borivali West, Mumbai, Maharashtra 400092',
        img: '/img/unisex.png',
        price: 6500,
        stars: 3.5,
        gender: 'unisex',
        interestedCount: 0,
        propertyimg: '/img/properties/1/pic17.jpg'
    },
    {
        id: '2',
        city: 'delhi',
        name: 'Saxenas Paying Guest',
        address: 'H.No. 3958 Kaseru Walan, Pahar Ganj, New Delhi, Delhi 110055',
        img: '/img/unisex.png',
        price: 8000,
        stars: 3.5,
        gender: 'unisex',
        interestedCount: 0,
        propertyimg: '/img/properties/1/pic5.avif'
    },
    {
        id: '3',
        city: 'chennai',
        name: 'Guardian Guest House ',
        address: 'Triplicane Near Star Theatre, Chennai',
        img: '/img/unisex.png',
        price: 5000,
        stars: 3.5,
        interestedCount: 0,
        gender: 'unisex',
        propertyimg: '/img/properties/1/pic25.jpeg'
    }
];


app.get('/property_detail/:city/:id', (req, res) => {
    if (req.isAuthenticated()) {
        // res.render("dashboard", { user: req.user });
        const city = req.params.city.toLowerCase();
        const propertyId = req.params.id;
        // Check if the requested city exists in cityProperties
        if (cityProperties.hasOwnProperty(city)) {
            const cityPropertiesArray = cityProperties[city];

            const property = cityPropertiesArray.find(prop => prop.id === propertyId);

            // Check if the property with the given id exists
            if (property) {
                res.render('property_detail', { property });
            } else {
                res.status(404).send('Property not found');
            }
        } else {
            res.status(404).send('City not found');
        }
    } else {
        res.redirect("/login");
    }
});



app.get('/index_property_detail/:id', (req, res) => {
    if (req.isAuthenticated()) {
        const propertyId = req.params.id;
        const property = indexproperties.find(prop => prop.id === propertyId);
        res.render('property_detail', { property });
    } else {
        res.redirect("/login");
    }
});

app.get('/search', (req, res) => {
    const searchCity = req.query.city.toLowerCase();
    const propertiesInCity = cityProperties[searchCity] || [];
    res.render("property_list", { cityProperties: cityProperties });
});




const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
