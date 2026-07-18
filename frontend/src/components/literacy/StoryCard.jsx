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
          <span style={{
            display:'inline-block', padding:'3px 10px', borderRadius:999,
            fontSize:11, fontWeight:700,
            background:'rgba(111,191,115,0.15)', color:'#4E9F52',
          }}>Age {story.age_group}</span>
          <span style={{
            display:'inline-block', padding:'3px 10px', borderRadius:999,
            fontSize:11, fontWeight:700,
            background:'rgba(124,77,255,0.1)', color:'#7C4DFF',
          }}>{story.difficulty}</span>
          <span style={{
            display:'inline-block', padding:'3px 10px', borderRadius:999,
            fontSize:11, fontWeight:700,
            background:'rgba(79,195,247,0.15)', color:'#0288D1',
          }}>{story.language}</span>
        </div>
        <div className={s.footer}>
          <span className={s.time}>⏱ {story.estimated_time}</span>
          <span className={s.stars}>⭐⭐⭐</span>
        </div>
      </div>
    </div>
  );
}
