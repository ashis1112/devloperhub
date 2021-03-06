const Profile=require('../model/Profile')
const User=require('../model/User')
const Post=require('../model/Post')

const { validationResult } = require('express-validator');
const request=require("request")
const config=require("config")

const createProfile=async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
        company,website,location,bio,status,githubusername,
        skill,youtube,facebook,twitter,instagram,linkedin
    }=req.body

    // Build profile object
    const profileFields={}
    profileFields.user=req.user

    if(company) profileFields.company=company
    if(website) profileFields.website=website
    if(location) profileFields.location=location
    if(status) profileFields.status=status
    if(bio) profileFields.bio=bio
    if(githubusername) profileFields.githubusername=githubusername
    if(skill){
        profileFields.skill=skill.split(',').map(skill=>skill.trim())
    }

    // Build social profile
    profileFields.social={}
    if(youtube) profileFields.social.youtube=youtube
    if(twitter) profileFields.social.twitter=twitter
    if(facebook) profileFields.social.facebook=facebook
    if(linkedin) profileFields.social.linkedin=linkedin
    if(instagram) profileFields.social.instagram=instagram

    try {
        let profile=await Profile.findOne({user:req.user})
        if(profile){
            // update
            profile=await Profile.findOneAndUpdate(
                {user:req.user},
                {$set:profileFields},
                {new:true}
            )
            return res.json(profile)

        }
        // Create
        profile=new Profile(profileFields)
        await profile.save()
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server Error")
    }

    res.send('create post')
}



const getProfile=async(req,res)=>{
    try{
        const profile=await Profile.find().populate('user',['name','avatar'])
        return res.send(profile)
    }catch(err){
        console.error(err.message)
        return res.status(500).send("Server Error")
    }

}

const myProfile=async(req,res)=>{
    const myprofile=await Profile.find({user:req.user}).populate('user',['name','avatar'])
    try {
        if(myprofile){
             res.send(myprofile)
        }
        res.send("Profile does't found")

    } catch (error) {
        console.log(error)
        res.status(500).send("Server Error")
    }
}

const singleid=async(req,res)=>{
    const id=req.params.id
    try{
        const profile=await Profile.findOne({user:id}).populate('user',['name','avatar'])
        if(!profile) return req.status(400).json({msg:"There is no profile for this user"})
        res.send(profile)
    }catch(err){
        console.error(err.message)
        if(err.kind == 'ObjectId'){
            return res.status(400).json({msg:"There is no profile for this user"})
        }
        res.status(500).send("Server Error")
    }
}

const updateExperience=async(req,res)=>{
    const error=validationResult(req)
    if(!error.isEmpty()){
        return  res.status(400).json({errors:error.array()})
    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }=req.body

    const newExp={
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile=await Profile.findOne({user:req.user})
        profile.experience.unshift(newExp)
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server Error")
    }
}
const updateEducation=async(req,res)=>{
    const error=validationResult(req)
    if(!error.isEmpty()){
        return  res.status(400).json({errors:error.array()})
    }
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }=req.body

    const newEdu={
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile=await Profile.findOne({user:req.user})
        profile.education.unshift(newEdu)
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server Error")
    }
}

const deleteProfile=async(req,res)=>{
    try{
        await Post.deleteMany({user:req.user})
        await Profile.findOneAndDelete({user:req.user})
        await User.findOneAndRemove({_id:req.user})
        res.json({msg:"User Deleted"})
    }catch(err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }

}

const deleteExperience=async(req,res)=>{
    try{
        const profile=await Profile.findOne({user:req.user})
        const removeindex=profile.experience
                          .map(item=>item.id)
                          .indexOf(req.params.exp_id)
       
        profile.experience.splice(removeindex,1)
        await profile.save()
        res.json(profile)
    }catch(err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }

}

const deleteEducation=async(req,res)=>{
    try{
        const profile = await Profile.findOne({user:req.user})
        const removeindex=profile.education
                          .map(item=>item.id)
                          .indexOf(req.params.edu_id)
       
        profile.education.splice(removeindex,1)
        await profile.save()
        res.json(profile)
    }catch(err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }

}

const getGithubrepo=(req,res)=>{
    try {
        const options={
            uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5&
            sort=created:asc&client_id=${config.get('gitclientid')}&client_secret=${config.get('gitclientsecret')}`,
            method:'GET',
            headers:{'user-agent':'node.js'}
        }
        request(options,(error,response,body)=>{
            if(error) console.error(error)
            if(response.statusCode !== 200){
                res.status(404).json({msg:"No Github profile found"})
            }
            res.send(JSON.parse(body))
        })
    } catch (error) {
        console.error(error)
        res.status(500).send("server error")
        
    }

}


module.exports={getGithubrepo,createProfile,getProfile,deleteExperience,deleteEducation,updateExperience,updateEducation,singleid,myProfile,deleteProfile}