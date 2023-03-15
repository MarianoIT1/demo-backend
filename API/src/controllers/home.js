const { Op } = require("sequelize");
const { Event, Address, Category, User, Review } = require("../db");
const jwt = require("jsonwebtoken");

const getEventsPublic = async (req, res) => { //modificque excluyendo el privateEvent_password en el finone del model event.
  try {
    const queryParams = req.query;

    const searchParams = {
      name: null,
      description: null,
      start_date: null,
      end_date: null,
      start_time: null,
      end_time: null,
      isPremium: null,
      isPaid: null,
      age_range: null,
      guests_capacity: null,
      placeName: null,
      advertisingTime_start: null,
      adversiting_end: null,
      cover_pic: null,
      disability_access: null,
      parking: null,
      smoking_zone: null,
      pet_friendly: null,
      isToday: null,
      isNextWeekend: null,
      "$organizer.id$": queryParams.organizer ? queryParams.organizer : null,
      "$category.id$": queryParams.category ? queryParams.category : null,
      "$category.modality$": queryParams.modality ? queryParams.modality : null,
      "$address.address_line$": queryParams.address_line
        ? queryParams.address_line
        : null,
      "$address.city$": queryParams.city ? queryParams.city : null,
      "$address.state$": queryParams.state ? queryParams.state : null,
      "$address.country$": queryParams.country ? queryParams.country : null,
      "$address.zip_code$": queryParams.zip_code ? queryParams.zip_code : null,
    };

    for (let prop in searchParams) {
      if (queryParams.hasOwnProperty(prop)) {
        searchParams[prop] = queryParams[prop];
      }
      if (searchParams[prop] === null) {
        delete searchParams[prop];
      }
    }

    searchParams.isPublic = true;
    searchParams.isActive = true;
    // searchParams.typePack = {[Op.or]: [
    //   {[Op.is]: null},
    //   {[Op.ne]: 'PREMIUM'}
    // ]}

    let {limit, page} = req.query
    limit = Number(limit)
    page = Number(page)
    const offset = (page - 1) * limit
    

    const publicEvents = await Event.findAll({
      where: searchParams,
      order: [['typePack', 'NULLS LAST']],
      attributes:  { exclude: ["privateEvent_password"] },
      include: [
        "bankAccount",
        {
          model: Address,
          as: "address",
          attributes: { exclude: ["id"] },
        },
        {
          model: User,
          as: "organizer",
          attributes: ["id", "name", "last_name", "profile_pic"],
        },
        {
          model: Category,
          as: "category",
          attributes: ["name", "modality"],
        },
      ],
      limit: limit && !Number.isNaN(Number(limit)) ? Number(limit) : null,
      offset: offset && !Number.isNaN(Number(offset)) ? Number(offset) : null,

    });

    res.json(publicEvents);
  } catch (error) {
    console.log(error)
    res.status(500).json({ msg: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const { Virtual } = req.body;
    const categories =
      Virtual === "true"
        ? await Category.findAll({ where: { modality: "Virtual" } })
        : Virtual === "false"
        ? await Category.findAll({ where: { modality: "Presential" } })
        : await Category.findAll();
    return res.status(200).json({ categories });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while getting the categories" });
  }
};

const getEventById = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findOne({
      where: { id },
      include: [
        "bankAccount",
        {
          model: Address,
          as: "address",
          attributes: { exclude: ["id"] },
        },
        {
          model: User,
          as: "organizer",
          attributes: ["id", "name", "last_name", "profile_pic"],
          include: [{
            model: Event,
            as: 'organizer',
            include: [{
              model: Review,
              where: {isActive: true},
              attributes: ["stars", "comment", "createdAt"],
              include: [
                {
                  model: User,
                  attributes: ["name", "last_name", "profile_pic"],
                  
                }
              ]
            }],
          }]
        },
        {
          model: Category,
          as: "category",
          attributes: ["name", "modality"],
        },
      ],
    }).then(r => r.toJSON());

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }  

    let userId = null

    const { authorization } = req.headers;
    if (authorization) {
    const token = authorization.split(" ")[1];
    jwt.verify(token, process.env.SECRET, (err, user) => {
      if (err) {
        console.log(err)
      } else {
        userId = user.id;
      }
    });
    }

    event.organizer.reviews = event.organizer.organizer.map(r => r.reviews).flat().map(r => { 
      r.reviewedBy = r.user
      delete r.user
      return r
    })
    delete event.organizer.organizer

    if (event.isPublic || event.organizer.id === userId) {
      res.json({  isPublic: true , event })
    } else {
      res.json ({ isPublic: false, event: { id: id, name: event.name , start_date: event.start_date, start_time: event.start_time }})
    } 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllPremiumEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      where: {
        typePack: 'PREMIUM',
      },
      include: [
        "bankAccount",
        {
          model: Address,
          as: "address",
          attributes: { exclude: ["id"] },
        },
        {
          model: User,
          as: "organizer",
          attributes: ["id", "name", "last_name", "profile_pic"],
        },
        {
          model: Category,
          as: "category",
          attributes: ["name", "modality"],
        },
      ],
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {

  getCategories,
  getEventsPublic,
  getEventById,
  getAllPremiumEvents,

};
