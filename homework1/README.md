# Homework 1: Beatbox

![Beatbox](./beatbox.jpg)


The first homework is implementing a simple beatbox with which you can play musical beats. The starter code is provided so that you can easily work on it. Checking out the following links will help you to get more understanding on it.  


[Wikipedia: Beatboxing](https://en.wikipedia.org/wiki/Beatboxing)

[Beatbox community: www.humanbeatbox.com](https://www.humanbeatbox.com/)

[Youtube: How to make basic beatbox sounds](https://www.youtube.com/watch?v=B6-45rswo0o)


## Step #1 
Practice the beatboxing and record your voice. You can modify the recorded samples using audio effects in [Audacity](http://www.audacityteam.org/) or other audio editing and processing software (e.g. Audition, Logic Pro X, Cubase, etc.)

## Step #2
Download the starter code and fill out the empty part. 
- Load the recorded audio samples and make sure if they are played correctly.  
- Add gain nodes for each sample in the web audio path. Control the gain parameter such that it adjusts the volume in dB scale with the range from -24 to 0 dB. 

## Step #3
Extend the starter code by 
- Adding more (different types of) beat samples and corresponding pad buttons on the GUI
- (Optional) Decorating the GUI with text or visual components 


## Step #4
Create your own homepage for this course and submit the code to it. I recommend you to use [Github Pages](https://pages.github.com/).



### Tips for coding

#### Http-server: simulating web servers on a local computer

Preloading sound samples from the server side (e.g. using XMLHttpRequest()) requires the client-server communication setting. This cannot be run by opening the html file in the local folder. Instead, we can simulate the server on local using a command-line tool called "http-server". For installation, refer to https://www.npmjs.com/package/http-server. Once you successfully install it, you can emulate the http server from your local path by typing this in command line:
```sh
$ http-server [path]
```
and this in the URL of web browser.
```sh
http://127.0.0.1:8080/ 
```
