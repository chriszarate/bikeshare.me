# [BikeShare.me][bikeshare]

## What is this?

It’s a simple tool to keep an eye on your most frequently used bike share stations. With a glance, you can tell whether your origin has enough bikes and your destination has enough docks. I made it for me, but you can use it, too.

## Why?

There are already quite a few apps that show you a map of nearby stations. I find them a bit fiddly. For the most part, I already know where the closest stations are—especially for the trips I take often. I just want to know if there are a reasonable number of available bikes or docks. I don’t want to interpret a graphic or click on stations one-by-one. I just want a list than I can check _quickly_ as I head out the door. This lets me do that.

## How do I use it?

Add stations, either by typing street names or clicking on the locate icon to find nearby stations. Click on a station to change its color—I use this to group stations by general location. Drag a station by its name to reorder or delete it.

The number in front of a solid circle (●) indicates available bikes. The number in front of an open circle (○) indicates available docks.

Use the tool at the bottom to change to a different city / bike share program.

## Does it sync somewhere?

Your stations are saved to local storage. Your browser will remember your stations, but they won’t be synced to other browsers. You can also click the share icon, which links to a snapshot of the current list of stations that you can share/save/bookmark. ([Here’s mine.][shared])

## It doesn’t work for me!

Sorry! If you’re able, please [file an issue at GitHub][issues]. Otherwise, you can write to me at &#97;&#100;&#109;&#105;&#110;&#64;&#98;&#105;&#107;&#101;&#115;&#104;&#97;&#114;&#101;&#46;&#109;&#101;.

## Run your own copy

Bikeshare.me uses [Node.js][nodejs], [Bower][bower], and [Grunt][grunt].

```
# Clone this GitHub repository.
git clone https://github.com/chriszarate/bikeshare.me bikeshare

# Install Node.js dependencies.
cd bikeshare && npm install

# Install Bower dependencies.
cd app && bower install

# Uglify dependencies.
grunt setup

# Uglify local code, minify CSS, generate HTML5 cache manifest, etc.
grunt default
```

Note that Bikeshare.me is expected to run at the site root.

You may want to use my customization to Typeahead.js v0.9.2 that ranks stations by distance. Read my comments in `app/js/lib/dataset.js` for more information.

## License

This project is released under the MIT license.

<!-- References -->
[bikeshare]: http://bikeshare.me
[shared]: http://bikeshare.me/nyc/a7b-a6Y-a6Z-a57-a2q-b4U-b4c-b6H-c6a-c4B-d4Q-d4J
[issues]: https://github.com/chriszarate/bikeshare.me/issues
[nodejs]: http://nodejs.org
[bower]: https://github.com/bower/bower
[grunt]: http://gruntjs.com/
