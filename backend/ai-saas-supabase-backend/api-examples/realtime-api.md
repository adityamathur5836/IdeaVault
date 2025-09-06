# Realtime API Examples for Supabase

This document provides examples of how to utilize Supabase's real-time capabilities to listen for changes in the database and update the frontend accordingly.

## Setting Up Real-time Subscriptions

To start using real-time features, ensure that you have set up your Supabase project and have the necessary client libraries installed in your frontend application.

### Example: Listening for New Ideas

To listen for new ideas being added to the database, you can use the following code snippet:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const subscribeToNewIdeas = () => {
  const ideasChannel = supabase
    .from('ideas')
    .on('INSERT', payload => {
      console.log('New idea added:', payload.new);
      // Update your frontend state here
    })
    .subscribe();
};

// Call the function to start listening
subscribeToNewIdeas();
```

### Example: Listening for Idea Updates

To listen for updates to existing ideas, use the following code:

```javascript
const subscribeToIdeaUpdates = () => {
  const ideasChannel = supabase
    .from('ideas')
    .on('UPDATE', payload => {
      console.log('Idea updated:', payload.new);
      // Update your frontend state here
    })
    .subscribe();
};

// Call the function to start listening
subscribeToIdeaUpdates();
```

### Example: Listening for Idea Deletions

To listen for deletions of ideas, you can implement the following:

```javascript
const subscribeToIdeaDeletions = () => {
  const ideasChannel = supabase
    .from('ideas')
    .on('DELETE', payload => {
      console.log('Idea deleted:', payload.old);
      // Update your frontend state here
    })
    .subscribe();
};

// Call the function to start listening
subscribeToIdeaDeletions();
```

## Handling Real-time Events

Make sure to handle the subscription lifecycle properly. You should unsubscribe when the component unmounts or when you no longer need to listen for changes:

```javascript
const unsubscribeFromIdeas = () => {
  ideasChannel.unsubscribe();
};

// Call this function when you want to stop listening
unsubscribeFromIdeas();
```

## Conclusion

Using Supabase's real-time features allows your application to respond instantly to changes in the database, providing a seamless user experience. Make sure to implement proper error handling and manage subscriptions effectively to maintain performance and reliability.