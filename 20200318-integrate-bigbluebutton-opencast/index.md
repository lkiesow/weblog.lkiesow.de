Integrate BigBlueButton with Opencast
=====================================

This is a short guide of how to integrate BigBlueButton with Opencas:

The Tools
---------

- [Opencast](https://opencast.org) is a free, open-source tool for automated
  recording, processing, analysis, management and publication of audio and
  video with a strong focus on higher education and lecture capture.

- [BigBlueButton](https://bigbluebutton.org/) is a web conferencing system
  designed for online learning.


The Idea
--------

Opencast is incredible when it comes to automated video processing and
publication while BigBlueButton is a very nice tool for web conferencing and
online lectures which does support recordings. The idea is to combine these two
systems so that recordings from BigBlueButton will end up in Opencast, will be
processed and finally published to the same locations other content will end up
as well (Opencast has a nice integration into many LMS and to some video
portals).

To reach this goal, we will add a simple small post-processing script to
BigBlueButton which will then upload it's recordings to Opencast as a final
step.


The Integration Script
----------------------

What we want to add in BigBlueButton is a post processing script as [described in the documentation](https://docs.bigbluebutton.org/dev/recording.html#writing-post-scripts).
This script should be located at (there should already be an example script in that folder):

    /usr/local/bigbluebutton/core/scripts/post_publish/post_publish.rb

The following script will simply take the recordings and upload them to Opencast.
Just update the Opencast server settings so that they point to your server:

```ruby
#!/usr/bin/ruby
# encoding: UTF-8

require "shellwords"
require "trollop"
require File.expand_path('../../../lib/recordandplayback', __FILE__)

opts = Trollop::options do
  opt :meeting_id, "Meeting id to archive", :type => String
end
meeting_id = opts[:meeting_id]

### opencast configuration begin

# Server URL
# oc_server = 'https://develop.opencast.org'
oc_server = 'https://develop.opencast.org'

# User credentials allowed to ingest via HTTP basic
# oc_user = 'username:password'
oc_user = 'admin:opencast'

# Workflow to use for ingest
# oc_workflow = 'schedule-and-upload'
oc_workflow = 'schedule-and-upload'

### opencast configuration end


logger = Logger.new("/var/log/bigbluebutton/post_publish.log", 'weekly' )
logger.level = Logger::INFO
BigBlueButton.logger = logger

published_files = "/var/bigbluebutton/published/presentation/#{meeting_id}"
meeting_metadata = BigBlueButton::Events.get_meeting_metadata("/var/bigbluebutton/recording/raw/#{meeting_id}/events.xml")

#
# Put your code here
#
BigBlueButton.logger.info("Upload Recording for [#{meeting_id}]...")

ingest = false
presenter = ''
presentation = ''
title = Shellwords.escape(meeting_metadata['meetingName'])
oc_user = Shellwords.escape(oc_user)

if (File.exists?(published_files + '/video/webcams.webm'))
  BigBlueButton.logger.info("Found presenter video")
  ingest = true
  presenter = "-F 'flavor=presentater/source' -F 'BODY1=@#{published_files + '/video/webcams.webm'}'"
end
if (File.exists?(published_files + '/deskshare/deskshare.webm'))
  BigBlueButton.logger.info("Found presentation video")
  ingest = true
  presentation = "-F 'flavor=presentation/source' -F 'BODY2=@#{published_files + '/deskshare/deskshare.webm'}'"
end
if (ingest)
  BigBlueButton.logger.info("Uploading...")
  puts `curl -u '#{oc_user}' "#{oc_server}/ingest/addMediaPackage/#{oc_workflow}" #{presenter} #{presentation} -F title="#{title}"`
end
BigBlueButton.logger.info("Upload for [#{meeting_id}] ends")

exit 0
```

You can also just [download `post_publish.rb`](post_publish.rb).


Limitations
-----------

This is a very simple integration, but should work just fine.
Nevertheless, there are a few limitations.

- Right now, only the room name is added as metadata to the recording.
- BigBlueButton includes audio only in the camera recording, not in the screen recording.
  Your Opencast workflow will need to fix that.


Have fun.


<time>Wed 18 Mar 2020 12:19:55 AM CET</time>
