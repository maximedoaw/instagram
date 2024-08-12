"use client"

import Image from 'next/image'
import Link from 'next/link'
import { signIn,useSession,signOut } from "next-auth/react";
import  Modal  from "react-modal";
import { useEffect, useRef, useState } from 'react';
import { IoIosAddCircleOutline } from "react-icons/io";
import { HiCamera } from "react-icons/hi"
import { AiOutlineClose } from "react-icons/ai"
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from '../firebase';
import { addDoc, collection, serverTimestamp} from "firebase/firestore";

function Header() {
  const { data : session } = useSession()
  const [isOpen,SetIsOpen] = useState(false)
  const [selectedFile,setSelectedFile] = useState(null)
  const [imageFileUrl,setImageFileUrl] = useState(null)
  const [imageFileUploading,setImageFileUploading] = useState(false)
  const [postUploading,setPostUploading] = useState(false)
  const [caption,setCaption] = useState('')
  const [submitPost,setSubmitPost] = useState(false)
  const filePickerRef = useRef(null)
  const addImageToPost = (e) =>{
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setImageFileUrl(URL.createObjectURL(file))
    }
  }

  useEffect(() =>{
    if(submitPost){
      uploadImageToStorage()
      setSubmitPost(false)
    }
  },[submitPost])

  async function uploadImageToStorage() {
    setImageFileUploading(true)
    const fileName = new Date().getTime() + '-' + selectedFile.name
    const storageRef = ref(storage,fileName)
    const uploadTask = uploadBytesResumable(storageRef,selectedFile)
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.error(error);
        setImageFileUploading(false);
        setImageFileUrl(null);
        setSelectedFile(null);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setImageFileUploading(false);
        });
      }
    );
  
    
  }
  const handleSubmit = async () => {
    setPostUploading(true)
    const docRef = await addDoc(collection(db,'posts'),{
      username : session.user.username,
      caption,
      profileImg : session.user.image,
      image : imageFileUrl,
      timestamp : serverTimestamp()
    })
    setSubmitPost(true)
    setPostUploading(false)
    SetIsOpen(false)
    
    location.reload()
  }
  return (
    <div className='shadow-sm border-b sticky
    top-0 bg-white z-30 p-3'>
      <div className='flex justify-between
      items-center max-width-6xl mx-auto'>
      {/* logo */}
        <Link href="/" className='hidden lg:inline-flex'>
           <Image 
            src='/Instagram_logo_black.webp'
            width={96}
            height={96}
            alt='instagram logo'
           />
        </Link>
        <Link href="/" className='lg:hidden'>
           <Image 
            src='/800px-Instagram_logo_2016.webp'
            width={40}
            height={40}
            alt='instagram logo'
           />
        </Link>

      {/* search input */}
        <input 
         type="text"
         placeholder='Search'
         className="bg-gray-50 border
         border-gray-200 rounded text-sm w-full
         py-2 px-4 max-w-[210px]"
        />

      {/* menu items */}
      {
        session ? (
          <div className='flex gap-2 items-center'>
            <IoIosAddCircleOutline className='text-2xl cursor-pointer
            transform hover:scale-125 transition duration-300 hover:text-red-600'
            onClick={() => SetIsOpen(true)}
            />
            <img
              src={session.user.image}
              alt={session.user.name}
              className='h-10 w-10 rounded-full cursor-pointer'
            />
          </div>
        ): (
          <button 
          onClick={() => signIn()}
          className='text-sm font-semibold
          text-blue-500'>
            Log In
          </button>
        ) 
      }
      </div>
      {isOpen && (
        <Modal isOpen={isOpen} className='max-w-lg w-[90%]
        p-6 absolute top-56 left-[50%] translate-x-[-50%]
        bg-white border-2 rounded-md shadow-md'
        onRequestClose={() => SetIsOpen(false)}
        ariaHideApp={false}
        >
          <div className='flex flex-col justify-center
          items-center h-[100%]'>
            {selectedFile ? (
              <img 
               src={imageFileUrl}
               alt="selected file"
               className={`max-h-[250px] w-full object-over cursor-pointer ${imageFileUploading ? 
                'animate-pulse' : ''
               }`}
               onClick={() => setSelectedFile(null)}
              />
            ): (
       
                <HiCamera className='text-4xl text-gray-400 
                cursor-pointer'
                onClick={() => filePickerRef.current.click()}
                />
              )}
                <input 
                hidden 
                ref={filePickerRef} 
                type="file" 
                accept='image/*'
                onChange={addImageToPost}
                />
          


            <input 
             type="text" 
             maxLength={150}
             placeholder='Please enter you caption...'
             className='m-4 border-none text-center w-full
             focus:outline-none'
             onChange={(e) => setCaption(e.target.value)}
            />
            <button  className='w-full bg-red-600
            text-white p-2 shadow-md rounded-lg
            hover:brightness-125 disabled:bg-gray-200 disabled:hover:brightness-100'
            disabled={ 
              !selectedFile ||
              caption.trim() === '' ||
              postUploading ||
              imageFileUploading
            }
            onClick={handleSubmit}
            >Upload Post</button>
            <AiOutlineClose className='cursor-pointer absolute top-2
            right-2 hover:text-red-600 transition duration-300'
            onClick={() => SetIsOpen(false)}
  
            />
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Header
