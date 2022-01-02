Each sub-directory has `hack_installer.js` and each one works differently:

* `simple`, as the name implies, just copies the file and runs it on one thread.

* `threaded` allows you to specify the number of threads, and it does a couple of checks to ensure it can be actually ran first.

* `max-threaded` is similar to threaded, but it just runs as the maximum, so it does not take any parameters. Consider it a `simple` version of `threaded`.