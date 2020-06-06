# Cuneiform-Sign-Detection-Webapp


This repository contains the web front-end of the web application presented in the article:
>Dencker, T., Klinkisch, P., Maul, S. M., and Ommer, B. (2020): Deep Learning of Cuneiform Sign Detection with Weak Supervision using Transliteration Alignment, PLOS ONE, 15:12, pp. 1–21
>[https://doi.org/10.1371/journal.pone.0243039](https://doi.org/10.1371/journal.pone.0243039)



The web front-end offers the following functionality:

- create collections of tablet images
- upload tablet images
- apply the sign detector
- visualize sign detections
- annotate cuneiform signs
- annotate lines

The web front-end has been developed using a combination of PHP and JavaScript.


### Requirements

- Apache web server (otherwise replace `.htaccess` files)
- PHP7 (with php-xml, php-curl, php-zip, php-gd packages)


### Installation

1) Create a copy of this repository on your machine so that the installed web server makes the web front end available through the browser.

2) Ensure that the `cuneiformbrowser/data` and `cuneiformbrowser/log` directory is writable.
One of several options is to use the chmod command, e.g. `$chmod -R 777 ./cuneiformbrowser/log/`

3) Setup your login preferences under `cuneiformbrowser/use