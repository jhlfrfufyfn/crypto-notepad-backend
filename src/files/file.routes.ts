import { RequestWithUser } from '../users/user.service';
import express from 'express';
import fileService from './file.service';
import { userService } from '../users/user.service';
const fileRouter = express.Router();

fileRouter.get('/', async (req: RequestWithUser, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).send('Unauthorized');
        return;
    }

    const files = await fileService.getFilesOfUser(userId);
    res.send(files);
});

fileRouter.get('/:id', async (req: RequestWithUser, res) => {
    const userId = req.user?.id;
    const fileId = req.params.id;
    if (!userId) {
        res.status(401).send('Unauthorized');
        return;
    }

    const file = await fileService.getFile(userId, fileId);
    if (!file) {
        res.status(404).send('File not found');
        return;
    }

    const text = (await fileService.getFileContent(file)).toString();

    /// do sime deciphering here

    res.send(text);
});

fileRouter.post('/', async (req: RequestWithUser, res) => {
    const userId = req.user?.id;
    if (!req.user || !userId) {
        res.status(401).send('Unauthorized');
        return;
    }

    const user = await userService.getUserById(userId);
    if (!user) {
        res.status(404).send('User not found');
        return;
    }

    if(!req.body.name) {
        res.status(400).send('File name is required');
        return;
    }
    res.send(await fileService.createFile({ owner: user, name: req.body.name }));
});

fileRouter.patch('/:id', async (req: RequestWithUser, res) => {
    const userId = req.user?.id;
    const fileId = req.params.id;
    console.count();
    console.log(fileId + ' ' + userId);
    if (!userId) {
        res.status(401).send('Unauthorized');
        return;
    }
    console.count();
    if (!fileId) {
        res.status(400).send('File id is required');
        return;
    }
    console.count();
    const file = await fileService.getFile(userId, fileId);
    if (!file) {
        res.status(404).send('File not found');
        return;
    }

    const text = req.body.context;
    if (!text) {
        res.status(400).send('No text provided');
        return;
    }

    /// do sime ciphering here

    await fileService.updateFileContent(file, text as string);
    res.send(file);
});

fileRouter.delete('/:id', async (req: RequestWithUser, res) => {
    const userId = req.user?.id;
    const fileId = req.params.id;
    if (!userId) {
        res.status(401).send('Unauthorized');
        return;
    }

    const file = await fileService.getFile(userId, fileId);
    if (!file) {
        res.status(404).send('File not found');
        return;
    }

    await fileService.deleteFile(file);
    res.send('File deleted');
});



export default fileRouter;