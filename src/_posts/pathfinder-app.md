---
title: "Pathfinder API"
excerpt: "This wasn't always about hiking but has over time morphed into the project over time. I originally wanted to learn how to make a simple image upload so a user could upload an image, it would be stored in some database, then displayed on the client side. Pretty simple yet I had not worked with anything of this nature since I had started my career so I started to plan it out..."
date: "2022-06-14T07:00:00.000Z"
author:
  name: Lucas Steinmacher
---

## One of my passion projects.


This wasn't always about hiking but has over time morphed into the project over time. I originally wanted to learn how to make a simple image upload so a user could upload an image, it would be stored in some database, then displayed on the client side. Pretty simple yet I had not worked with anything of this nature since I had started my career so I started to plan it out.

At first I found a naive solution that entailed converting the file/image into a byte array and store it on a database and just retrieve it and convert it back to a file and display it on the client side. The issue with this approach is that the amount of data in the database would grow exponentially and bog down the server with too many images. Alternatively I found that storing the actual byte array in a BLOB storage such as Amazon Simple Storage Service (AWS S3 for short) is a much more efficient way of storing large amounts of images and retrieving them. All the SQL database would need to do is save the pointer, in this case a universal resource locator(URL), to the image and display that on the client side. There are pros and cons to this that I will cover now.

**Pros**
- It is easier to keep the BLOB data synchronized with the remaining items in the row.
- BLOB data is backed up with the database. Having a single storage system can ease administration.
- SQL Server Full Text Search (FTS) operations can be performed against columns that contain fixed or variable-length character (including Unicode) data. You can also perform FTS operations against formatted text-based data contained within image fields—for example, Microsoft Word or Microsoft Excel documents.

**Cons**
- Retrieving an image from a database incurs significant overhead compared to using the file system.
- Disk storage on database SANs is typically more expensive than storage on disks used in Web server farms.

After I had implemented the image upload and was successfully showing them on a rudimentary front end I sat on the project for a while to decide what to do with this project.

I finally came upon the idea for this hike finding app after using other apps that lacked a few features that I desired such as tags for types of hikes such as "Dog Walking" or "Running" as well as heatmaps to tell which trails are not occupied heavily at the time.  An issue that comes up often on the trails near where I live in the Pacific NorthWest where hiking is quite popular.

 This is an ongoing project that I will work on often and try to keep this site up to date on its status.


---

#### Features That I want the api to provide
Including but not limited to:

- It will have a comprehensive list of hikes, trails, and walks that are in a given distance that the user specifies
- The users may comment, rate, and upload pictures of trails
- The users may contact the admin to request a new trail be added to the database
   - The admin will be able to add the trail to the database
- Show some sort of "Traffic" display that shows how busy the trail is
   - For this I will be calling to the www.besttime.app API
   - This has not been integrated in the current iteration of the app
- Show weather of the trails trailhead
   - For this the api will call the external api of www.openweathermap.org/
   - Api call being made with Java WebClient
- The user will have the ability to filter hikes by
   - Length of the trail
   - Type of trail
   - Distance from the User
   - Popularity of the trail (mainly in my mind to find unpopulated hikes.)
   - Weather (Or to filter out trails with adverse weather.)
- The user may "Save" their place on a list of hikes as well as save hikes to their hearted list
   - This has not been integrated in the current iteration of the app

---
#### Stack

- Services written in Java with Spring Boot using Maven
- File storage on AWS S3
- Database is PostgreSQL

