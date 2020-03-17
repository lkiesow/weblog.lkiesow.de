Minimal Responsive Design for Websites
======================================

Responsive design for Websites becomes more and more important. Everyone has a
smartphone and more and more people actually learn how to use it. One good choice
to deal with this is to use [Boostrap](httpis://getbootstrap.com), the probably
most pupolar responsive design framework. This is a sane choice, but it will
also pull in a lot of code you probably do not need, increasing your sites file
size.

Fiel size might be no problem for multimedia sites serving videos, images etc.
but it is to small sites like this one. And it is actually pretty easy to
archive a basic support for responsive design without a large framework.


The Goal
--------

What we want to archive it a page that:

 - Looks like it did before on large screens
 - Uses the full width on smaller screens
 - has an increased text size on small screens
 - Doing that with as little code as possible


The Viewport
------------

The viewport on websizes describes how a page should be rendered by the browser
and how it should be fit into the screen. Basically, it describes what a user
will see when the page is loaded.

This is the first thing that should be modified when optimizing a page for
mobile view. What we want is to tell the browser to render the page to the
devices width:

    <meta name=viewport content="width=device-width, initial-scale=1">

The additional `initial-scale` defines the zoom level when the page is loaded.
While you would expect this to be `1` by default, setting this explicitely,
will make some mobile browsers also use this setting when the devices
orientation changes (e.g. a smartphone is brought into landscape mode).

While this should already do the trick, you can read more about this on this
[w3schools article](https://w3schools.com/css/css_rwd_viewport.asp).


The Default Font Size
---------------------

The second thing you want to do is defining the default font size. This is not
necessary the font size you later want to use for a mobile device but the one
you use *by default*.

[Google recommends
](https://developers.google.com/speed/docs/insights/UseLegibleFontSizes) using
`16px` as base font size which I think is a good choice. Remember, these are
CSS pixels which actual size is based on device size and density.

They also recommend to increase the line-height, which I think highly depends
on the used font-face and which I would not recommend in general. Hence I stick
with:

    body {
      font-size: 16px;
    }


CSS Media Queries
-----------------

Finally, we now want to increase the font size on mobile devices. For this we
can use CSS media queries which lets us add specific CSS rules active only if
certain device or browser properties match. In short, we will set a new base
font size if we are on a mobile device like a smartphone.

    @media only screen and (max-width: 500px) {
      body {
        font-size: 22px;
      }
    }

Again, these are CSS pixels and even if your device has a higher screen
resolution, this should catch. A carefuly usage would even let you distinguish
between different device types. For more details on media queries have a look
at this [w3schools article
](https://w3schools.com/cssref/css3_pr_mediaquery.asp)


Final Notes
-----------

This is basically it. It is not very complicated at all. Still there are some
things that might break your mobile view when you are not careful. Here are
some things to avoid:

 - Do not set large fixed widths for anything. If you want to restrict the size
	of your article block, you image or whatever, use `max-width` instead. This
	will let a browser scale that element down if necessary and not resize your
	whole page.

 - While the underlying problem is almost the same, code snippets or other
	things in an HTML `pre` tag may be problematic. Here you have to decide if
	you want to decrease the font size, break lines after all, or (my
	recommendation) make the specific block vertically scrollable using the CSS
	property `overflow-y: auto`.

 - Long words a browser cannot break on its own may also be problematic. If you
	have long, continuous texts for example as title, you may want to add HTML5
	`<wbr \>` tags to mark places in a work on which a browser may break it
	after all.


<time>Sun Jan 24 18:05:04 CET 2016</time>
