Hacking Bikeshare.me
====================

This is a guide to get up and running with bikeshare.me

Get the source
--------------

The source is hosted on [github] and can be found at [Chris Zaratei's Repo][source]

```
cd ~
mkdir bikeshare
git clone https://github.com/chriszarate/bikeshare.me bikeshare
```

Install node.js
---------------

You can get [noje.js][nodejs] from going to the download page on their website.

[http://nodejs.org/download/][nodejs_download]

Install npm
-----------

node.js now comes with npm.

Install Node Dependencies
-------------------------

```
cd ~/bikeshare
npm install
```

Install Javascript Dependencies using [bower][bower]
-------------------------------------------

```
cd ~/bikeshare/apps
bower install --config.directory=components
```

Run the needed tasks to concat and uglify using [grunt][grunt]
-----------------------------------------------------

```
grunt
grunt components
grunt templates
```

References
----------

[github]: http://github.com
[source]: https://github.com/chriszarate/bikeshare.me
[nodejs]: http://nodejs.org
[nodejs_download]: http://nodejs.org/download
[bower]: https://github.com/bower/bower
[grunt]: http://gruntjs.com/
