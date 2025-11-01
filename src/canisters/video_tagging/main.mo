import OrderedMap "mo:base/OrderedMap";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import List "mo:base/List";
import Nat "mo:base/Nat";

actor VideoTagging {
  transient let textMap = OrderedMap.Make<Text>(Text.compare);

  var videos : OrderedMap.Map<Text, Video> = textMap.empty();
  var nextVideoId = 0;

  public type EventTag = {
    eventType : Text;
    timestamp : Nat;
    createdAt : Time.Time;
  };

  public type Video = {
    id : Text;
    title : Text;
    tags : [EventTag];
    createdAt : Time.Time;
  };

  public func createVideo(title : Text) : async Text {
    let videoId = "video-" # Nat.toText(nextVideoId);
    let newVideo : Video = {
      id = videoId;
      title;
      tags = [];
      createdAt = Time.now();
    };
    videos := textMap.put(videos, videoId, newVideo);
    nextVideoId += 1;
    videoId;
  };

  public func addTag(videoId : Text, eventType : Text, timestamp : Nat) : async Bool {
    switch (textMap.get(videos, videoId)) {
      case (null) { false };
      case (?video) {
        let newTag : EventTag = {
          eventType;
          timestamp;
          createdAt = Time.now();
        };
        let tagList = List.fromArray<EventTag>(video.tags);
        let updatedTags = List.toArray(List.push(newTag, tagList));
        let updatedVideo : Video = {
          id = video.id;
          title = video.title;
          tags = updatedTags;
          createdAt = video.createdAt;
        };
        videos := textMap.put(videos, videoId, updatedVideo);
        true;
      };
    };
  };

  public query func getVideo(videoId : Text) : async ?Video {
    textMap.get(videos, videoId);
  };

  public query func getAllVideos() : async [Video] {
    Iter.toArray(textMap.vals(videos));
  };
};