// src/components/StoryCard.jsx – updated with author, bookmark, topic
import s from "./StoryCard.module.css";

export default function StoryCard({ story, onClick, bookmarked, onBookmark }) {
  return (
    <div className={s.card} onClick={()=>onClick(story)}>
      <div className={s.cover} style={{background:(story.cover_gradient||"").replace(/;+$/,"").trim()}}>
        <span className={s.coverEmoji}>{story.emoji}</span>
        {onBookmark && (
          <button className={`${s.bm} ${bookmarked?s.bmOn:""}`}
            onClick={onBookmark} title={bookmarked?"Remove bookmark":"Bookmark"}>
            {bookmarked?"🔖":"🏷️"}
          </button>
        )}
      </div>
      <div className={s.body}>
        <h3 className={s.title}>{story.title}</h3>
        <p className={s.author}>✍️ {story.author||"SpacECE Team"}</p>
        {story.topic && <p className={s.topic}>🏷️ {story.topic}</p>}
        <div className={s.meta}>
          <span className="tag tag-age">Age {story.age_group}</span>
          <span className="tag tag-diff">{story.difficulty}</span>
          <span className="tag tag-lang">{story.language}</span>
        </div>
        <div className={s.footer}>
          <span className={s.time}>⏱ {story.estimated_time}</span>
          <span className={s.stars}>⭐⭐⭐</span>
        </div>
      </div>
    </div>
  );
}
