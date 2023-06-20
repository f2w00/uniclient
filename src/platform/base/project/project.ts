import {mkdirSync, writeFileSync} from 'fs'
import {workspaceAttribute} from '../../../client/workspace/workspace'

export interface IProject {
    workspace: workspaceAttribute
    storagePath: string
    projectName: string
    projectType: string
}

export class ProjectManagerFactory {
    static currentManager: ProjectManager
    static currentProject: IProject

    static produceProjectManager(project: IProject) {
        let manager = new ProjectManager(project)
        ProjectManagerFactory.currentProject = project
        ProjectManagerFactory.currentManager = manager
        return manager
    }

    static createProject(filePath: string, project: IProject) {
        mkdirSync(filePath)
        mkdirSync(filePath + '\\.project')
        writeFileSync(filePath + '\\.project' + '/project.json', JSON.stringify(project))
        ProjectManagerFactory.currentManager = new ProjectManager(project)
    }

    static getCurrentProject() {
        return ProjectManagerFactory.currentProject
    }
}

export class ProjectManager {
    constructor(project: IProject) {}
}
