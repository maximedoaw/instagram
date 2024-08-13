"use client"

import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { HiOutlineHeart,HiHeart } from "react-icons/hi";
import { db } from "../firebase";

function LikeSection({ id }) {
  const {data: session} = useSession()
  const [hasLiked,setHasLiked] = useState(false)
  const [likes,setLikes] = useState([])
  
  useEffect(() =>{
    onSnapshot(collection(db,'posts',id,'likes'),
    (snapshot) =>{
      setLikes(snapshot.docs)
    }
  )
  },[db])

  useEffect(() =>{
    likes.findIndex((like) => like.id === session?.user?.uid) !== -1 ?  setHasLiked(true) : setHasLiked(false)
    
  },[likes])

  const likePost = async () =>{
    if(hasLiked){
      await deleteDoc(doc(db,'posts',id,'likes',session?.user?.uid))
    }
    else{
      await setDoc(doc(db, 'posts', id, 'likes', session?.user?.uid), {
        username: session?.user?.username,
      });  
    }
  }
  return (
    <div>
      {session && (
        <div className="flex border-t
        border-gray-100 px-4 pt-4">
          <div className="">
            {hasLiked ? (
              <HiHeart className="text-red-500 cursor-pointer
              text-3xl hover:scale-125 transition-transform 
              duration-200 case-out"
              onClick={likePost}
              />
            ) : (
              <HiOutlineHeart className="cursor-pointer
              text-3xl hover:scale-125 transition-transform 
              duration-200 case-out"
              onClick={likePost}
              />
            )
            }
          </div>
            {likes.length > 0 && (
              <p className="text-gray-500">
                {likes.length} {likes.length === 1 ? 'like' : 'likes'}
              </p>
            )}
          </div>
        
      )
      }
      
    </div>
  )
}

export default LikeSection
