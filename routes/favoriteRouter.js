const express = require('express')
const Favorite = require('../models/favorite');
const Campsite = require('../models/campsite')
const authenticate = require('../authenticate')
const cors = require('./cors')

const favoriteRouter = express.Router()

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) 

.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Favorite.findOne({ user:req.user._id })
    .then(favorite => {
        if (favorite) {
            req.body.forEach(addedFavorite => {
                if (!favorite.campsites.includes(addedFavorite._id)) {
                    favorite.campsites.push(addedFavorite)
                }
            })
            favorite.save()
            .then(addedFavorite => {
                console.log('New favorite added ', addedFavorite)
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(addedFavorite);
            })
        } else {
            Favorite.create({ campsites:req.body, user:req.user._id })
            .then(createdFavorite => {
                console.log('New favorite created ', createdFavorite)
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(createdFavorite);
            })
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Favorite.findOneAndDelete({ user:req.user._id })
    .then(favorite => {
        if (favorite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete.')
        }
    })
    .catch(err => next(err));
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`)
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user:req.user._id })
    .then(favorite => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if (campsite) {
                if (favorite) {
                    if (!favorite.campsites.includes(req.params.campsiteId)) {
                        favorite.campsites.push(req.params.campsiteId)
                        favorite.save()
                        .then(updatedFavoriteId => {
                            console.log('New favorite created ', updatedFavoriteId)
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(updatedFavoriteId);
                        })
                        .catch(err => next(err))
                    } else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'text/plain');
                        res.end('That campsite is already in the list of favorites!')
                    }
                } else {
                    Favorite.create({ user:req.user._id, campsites: [req.params.campsiteId] })
                    .then (createdFavorite => {
                        console.log('New favorite created ', createdFavorite)
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(createdFavorite);
                    })
                    .catch(err => next(err))
                }  
            } else {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'text/plain');
                res.end('This campsite does not exist!');
            }
        })
        .catch(err => next(err))
    })
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`)
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Favorite.findOne({ user:req.user._id })
    .then(favorite => {
        if (favorite) {
            if (favorite.campsites.includes(req.params.campsiteId)) {
                const result = favorite.campsites.filter( item => {!item._id.equals(req.params.campsiteId)})
                favorite.campsites = result
                favorite.save()
                .then(deletedFavoriteId => {
                    console.log('Favorite deleted ', deletedFavoriteId)
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(deletedFavoriteId);
                })
                .catch(err => next(err))
            } else {
                res.setHeader('Content-Type', 'text/plain');
                res.end('This campsite is not in your list of favorites.')
                .catch(err => next(err))
            }
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.end('There are no favorites to delete!')
        }
    })
    .catch(err => next(err));
})

module.exports = favoriteRouter